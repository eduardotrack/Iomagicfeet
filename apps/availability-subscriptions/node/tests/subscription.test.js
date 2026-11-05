const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { Readable } = require('node:stream')
const test = require('node:test')
const ts = require('typescript')

// Compile the real TypeScript handler without booting the VTEX IO runtime.
// The body parser is real; only the Master Data service and Koa context are mocked.
const compiledModules = new Map()
function loadTypeScript(filename) {
  const absolute = path.resolve(__dirname, '..', filename)
  if (compiledModules.has(absolute)) return compiledModules.get(absolute)
  const source = fs.readFileSync(absolute, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: absolute,
  })
  const exports = {}
  const localRequire = name => name.startsWith('.')
    ? loadTypeScript(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(absolute), `${name}.ts`)))
    : require(name)
  new Function('require', 'exports', compiled.outputText)(localRequire, exports)
  compiledModules.set(absolute, exports)
  return exports
}

const { subscribeAvailability } = loadTypeScript('routes/subscribeAvailability.ts')
const { validateSubscription } = loadTypeScript('validation/subscription.ts')

function validPayload(overrides = {}) {
  return { name: 'Maria Silva', email: 'maria@example.com', skuId: '12345', acceptTerms: true, ...overrides }
}

function context(options = {}) {
  const input = options.raw === undefined ? JSON.stringify(options.payload || validPayload()) : options.raw
  const req = Readable.from([Buffer.from(input)])
  req.headers = {
    'content-type': options.contentType || 'application/json',
    'content-length': String(Buffer.byteLength(input)),
  }
  if (options.chunked) delete req.headers['content-length']
  const headers = {
    origin: 'https://www.magicfeet.com.br',
    'sec-fetch-site': 'same-origin',
    ...options.headers,
  }
  const resultHeaders = {}
  const calls = []
  const logs = []
  const ctx = {
    req,
    host: 'www.magicfeet.com.br',
    get: name => headers[name.toLowerCase()] || '',
    is: contentType => req.headers['content-type'].split(';')[0] === contentType,
    set: (name, value) => { resultHeaders[name.toLowerCase()] = value },
    clients: {
      masterdata: {
        createDocument: async document => {
          calls.push(document)
          if (options.error) throw options.error
          return Object.prototype.hasOwnProperty.call(options, 'saved')
            ? options.saved
            : { Id: 'AS-test', DocumentId: 'test-document', Href: '/private/test-document' }
        },
      },
    },
    vtex: { logger: { error: value => logs.push(value) } },
  }
  return { ctx, calls, logs, resultHeaders }
}

test('saves only normalized fields to AS and confirms only after persistence', async () => {
  const input = context({ payload: validPayload({ name: '  Maria Silva  ', email: '  MARIA@EXAMPLE.COM  ' }) })
  const before = Date.now()
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 201)
  assert.deepEqual(input.ctx.body, { success: true })
  assert.equal(input.calls.length, 1)
  const [document] = input.calls
  assert.equal(document.dataEntity, 'AS')
  assert.deepEqual(Object.keys(document.fields).sort(), ['createdAt', 'email', 'name', 'skuId'])
  assert.equal(document.fields.name, 'Maria Silva')
  assert.equal(document.fields.email, 'maria@example.com')
  assert.equal(document.fields.skuId, '12345')
  assert.ok(Date.parse(document.fields.createdAt) >= before)
  assert.ok(Date.parse(document.fields.createdAt) <= Date.now())
  assert.equal(input.resultHeaders['cache-control'], 'no-store, private')
  assert.equal(input.resultHeaders.pragma, 'no-cache')
  assert.deepEqual(input.logs, [])
  assert.ok(!JSON.stringify(input.ctx.body).includes('test-document'))
})

test('does not acknowledge a successful HTTP call without a saved DocumentId', async () => {
  for (const saved of [undefined, null, {}, { Id: 'AS-test' }]) {
    const input = context({ saved })
    await subscribeAvailability(input.ctx)
    assert.equal(input.ctx.status, 502)
    assert.notEqual(input.ctx.body.success, true)
    assert.equal(input.calls.length, 1)
  }
})

test('keeps the request pending until Master Data confirms the insert', async () => {
  let confirmSave
  const pendingSave = new Promise(resolve => { confirmSave = resolve })
  const input = context({ saved: pendingSave })
  const pendingRequest = subscribeAvailability(input.ctx)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(input.calls.length, 1)
  assert.notEqual(input.ctx.status, 201)
  assert.notEqual(input.ctx.body && input.ctx.body.success, true)
  confirmSave({ DocumentId: 'confirmed-document' })
  await pendingRequest
  assert.equal(input.ctx.status, 201)
  assert.deepEqual(input.ctx.body, { success: true })
})

for (const status of [400, 401, 403, 500, 503]) {
  test(`Master Data ${status} never produces success or leaks PII / upstream response`, async () => {
    const error = new Error('maria@example.com secret-token')
    error.response = { status, data: { Message: 'Cannot write in private fields', email: 'maria@example.com' } }
    const input = context({ error })
    await subscribeAvailability(input.ctx)
    assert.equal(input.ctx.status, 502)
    assert.equal(input.calls.length, 1)
    assert.notEqual(input.ctx.body.success, true)
    assert.deepEqual(input.logs, [{ message: 'availability-subscription-save-failed', upstreamStatus: status }])
    const observable = JSON.stringify({ body: input.ctx.body, logs: input.logs })
    assert.ok(!observable.includes('maria@example.com'))
    assert.ok(!observable.includes('secret-token'))
    assert.ok(!observable.includes('Cannot write in private fields'))
  })
}

test('rate limiting from Master Data returns 429 with Retry-After and no automatic retry', async () => {
  const input = context({ error: { response: { status: 429 } } })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 429)
  assert.equal(input.resultHeaders['retry-after'], '60')
  assert.equal(input.calls.length, 1)
  assert.notEqual(input.ctx.body.success, true)
})

test('network timeout is an actionable failure and never a false success', async () => {
  const input = context({ error: Object.assign(new Error('timeout maria@example.com'), { code: 'ECONNABORTED' }) })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 502)
  assert.equal(input.calls.length, 1)
  assert.ok(!JSON.stringify(input.logs).includes('maria@example.com'))
})

for (const [field, value] of Object.entries({
  id: 'existing-document', dataEntity: 'CL', createdAt: '2000-01-01', notificationSend: true,
  sendAt: '2000-01-01', arbitrary: 'value', __extra: 'value',
})) {
  test(`rejects untrusted ${field} instead of forwarding arbitrary writes`, async () => {
    const input = context({ payload: { ...validPayload(), [field]: value } })
    await subscribeAvailability(input.ctx)
    assert.equal(input.ctx.status, 400)
    assert.equal(input.calls.length, 0)
  })
}

test('rejects JSON prototype manipulation properties', async () => {
  const raw = JSON.stringify(validPayload()).replace('}', ',"__proto__":{"dataEntity":"CL"}}')
  const input = context({ raw })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 400)
  assert.equal(input.calls.length, 0)
})

for (const [label, payload] of [
  ['missing consent', { ...validPayload(), acceptTerms: undefined }],
  ['false consent', validPayload({ acceptTerms: false })],
  ['string consent', validPayload({ acceptTerms: 'true' })],
  ['numeric consent', validPayload({ acceptTerms: 1 })],
  ['missing name', validPayload({ name: undefined })],
  ['short name', validPayload({ name: 'a' })],
  ['blank name', validPayload({ name: '  ' })],
  ['long name', validPayload({ name: 'a'.repeat(101) })],
  ['control character in name', validPayload({ name: 'Maria\nSilva' })],
  ['object name', validPayload({ name: {} })],
  ['missing email', validPayload({ email: undefined })],
  ['invalid email', validPayload({ email: 'email-invalid' })],
  ['email with whitespace', validPayload({ email: 'maria silva@example.com' })],
  ['long email', validPayload({ email: `${'a'.repeat(250)}@a.com` })],
  ['email array', validPayload({ email: ['maria@example.com'] })],
  ['missing SKU', validPayload({ skuId: undefined })],
  ['numeric SKU', validPayload({ skuId: 12345 })],
  ['invalid SKU', validPayload({ skuId: '../CL' })],
  ['zero SKU', validPayload({ skuId: '0' })],
  ['negative SKU', validPayload({ skuId: '-1' })],
  ['decimal SKU', validPayload({ skuId: '1.5' })],
  ['long SKU', validPayload({ skuId: '1'.repeat(21) })],
]) {
  test(`validates ${label} at server boundary`, async () => {
    const input = context({ payload })
    await subscribeAvailability(input.ctx)
    assert.equal(input.ctx.status, 400)
    assert.equal(input.calls.length, 0)
  })
}

test('validator rejects non-object roots', () => {
  for (const root of [null, undefined, [], 'text', 42, true]) {
    assert.equal(validateSubscription(root), null)
  }
})

test('validator accepts boundary lengths and an international name', () => {
  assert.deepEqual(validateSubscription(validPayload({ name: 'João da Silva', skuId: '1'.repeat(20) })), {
    name: 'João da Silva', email: 'maria@example.com', skuId: '1'.repeat(20),
  })
  assert.ok(validateSubscription(validPayload({ name: 'a'.repeat(100) })))
})

for (const raw of ['{', '[1,2]', 'null', '"value"']) {
  test(`invalid JSON request ${raw} cannot write Master Data`, async () => {
    const input = context({ raw })
    await subscribeAvailability(input.ctx)
    assert.equal(input.ctx.status, 400)
    assert.equal(input.calls.length, 0)
  })
}

test('limits the actual request body to 4 KB', async () => {
  const input = context({ payload: validPayload({ name: 'x'.repeat(5000) }) })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 413)
  assert.equal(input.calls.length, 0)
})

test('limits chunked bodies even without a Content-Length header', async () => {
  const input = context({ payload: validPayload({ name: 'x'.repeat(5000) }), chunked: true })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 413)
  assert.equal(input.calls.length, 0)
})

test('rejects non-JSON content type before parsing or writing', async () => {
  const input = context({ contentType: 'application/x-www-form-urlencoded', raw: 'email=maria@example.com' })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 415)
  assert.equal(input.calls.length, 0)
})

for (const [label, headers] of [
  ['cross-site browser', { 'sec-fetch-site': 'cross-site' }],
  ['different origin', { origin: 'https://attacker.example.com' }],
  ['deceptive origin prefix', { origin: 'https://www.magicfeet.com.br.attacker.example.com' }],
  ['insecure origin', { origin: 'http://www.magicfeet.com.br' }],
  ['opaque origin', { origin: 'null' }],
  ['malformed origin', { origin: 'not-a-url' }],
]) {
  test(`rejects ${label} before reading or writing PII`, async () => {
    const input = context({ headers })
    await subscribeAvailability(input.ctx)
    assert.equal(input.ctx.status, 403)
    assert.equal(input.calls.length, 0)
  })
}

test('accepts same-origin requests and absent optional browser headers', async () => {
  const input = context({ headers: { origin: '', 'sec-fetch-site': '' } })
  await subscribeAvailability(input.ctx)
  assert.equal(input.ctx.status, 201)
  assert.equal(input.calls.length, 1)
})
