const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

// Portable destination: <monorepo>/magicApp/tests/faq/weni-chat.test.cjs.
// MF_APP_ROOT and MF_THEME_ROOT select independent staging roots.
const { componentDir, assetDir, getProjectRequire } = require('./test-paths.cjs')
const projectRequire = getProjectRequire()
const React = projectRequire('react')
const { JSDOM } = projectRequire('jsdom')
const babel = projectRequire('@babel/core')
const jsxPlugin = projectRequire('@babel/plugin-transform-react-jsx')
const modulesPlugin = projectRequire('@babel/plugin-transform-modules-commonjs')
const cache = new Map()
const styles = new Proxy({}, { get: (_, key) => typeof key === 'string' ? key : undefined })

const loadComponentModule = name => {
  const file = path.join(componentDir, name)
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file,
    configFile: false,
    babelrc: false,
    plugins: [jsxPlugin, modulesPlugin],
  })
  const testRequire = request => {
    if (request === 'vtex.css-handles') return { useCssHandles: names => ({ handles: Object.fromEntries(names.map(key => [key, key])) }) }
    if (request === 'vtex.rich-text') return { index: ({ text }) => React.createElement('div', null, text) }
    if (request === './styles.css') return { __esModule: true, default: styles }
    if (['./model', './schema', './assetDefaults'].includes(request)) return loadComponentModule(request.slice(2) + '.js')
    if (/\.(?:png|svg)$/.test(request)) assert.fail('The chat change must preserve Assets Builder URLs, not React image imports')
    return projectRequire(request)
  }
  new Function('require', 'module', 'exports', code)(testRequire, module, module.exports)
  return module.exports
}

const Component = loadComponentModule('index.jsx').default
const { getSettings } = loadComponentModule('model.js')
const getSchema = loadComponentModule('schema.js').getSchema
const { act } = React

const oldCmsProps = () => ({
  support: {
    items: [{
      id: 'returns',
      __editorItemTitle: 'Troca e devolução',
      title: 'Troca e devolução',
      label: 'Solicitar',
      action: { type: 'chat', url: '', newTab: false },
    }],
  },
})

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((onResolve, onReject) => { resolve = onResolve; reject = onReject })
  return { promise, resolve, reject }
}

const withChatPage = async (props, configure, check) => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><section class="weni-launcher"></section></body></html>', { url: 'https://faq--magicfeet.myvtex.com/institucional/atendimento' })
  const previous = Object.fromEntries(['window', 'document', 'navigator', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]))
  Object.defineProperty(global, 'window', { value: dom.window, configurable: true, writable: true })
  Object.defineProperty(global, 'document', { value: dom.window.document, configurable: true, writable: true })
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
  Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true, writable: true })
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  dom.window.HTMLElement.prototype.scrollBy = function scrollBy({ left }) { this.scrollLeft += left }
  const { createRoot } = projectRequire('react-dom/client')
  const root = createRoot(dom.window.document.getElementById('app'))
  const page = {
    window: dom.window,
    document: dom.window.document,
    click: async label => {
      const button = Array.from(dom.window.document.querySelectorAll('button')).find(element => element.textContent.trim() === label)
      assert.ok(button, 'Button exists: ' + label)
      await act(async () => { button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })) })
    },
    flush: async callback => act(async () => { callback(); await Promise.resolve() }),
  }
  try {
    if (configure) await configure(page)
    await act(async () => root.render(React.createElement(Component, props)))
    await check(page)
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(global, key, descriptor)
      else delete global[key]
    }
  }
}

test('only the returns action gets the initial phrase, including previously saved CMS items', () => {
  const settings = getSettings()
  assert.equal(settings.support.items.find(item => item.id === 'returns').action.message, 'Troca e devolução')
  assert.ok(settings.support.items.filter(item => item.id !== 'returns').every(item => !item.action.message))
  assert.ok(settings.contacts.items.every(item => !item.action.message))
  const cms = oldCmsProps()
  const before = JSON.stringify(cms)
  assert.equal(getSettings(cms).support.items[0].action.message, 'Troca e devolução')
  assert.equal(JSON.stringify(cms), before, 'Fallback must not rewrite CMS content')
  const field = getSchema().properties.support.properties.items.items.properties.action.properties.message
  assert.ok(field, 'The initial phrase has an identifiable Site Editor field')
  assert.match(field.title, /^Apoio · /)
  assert.ok(!Object.hasOwn(field, 'default'), 'A blank schema default would mask the returns fallback in old CMS content')
})

test('Solicitar opens the root Weni API before sending the exact phrase; Entrar no chat never sends', async () => {
  const calls = []
  await withChatPage(oldCmsProps(), ({ window }) => {
    window.WebChat = {
      open: async () => { calls.push(['open']) },
      send: async message => { calls.push(['send', message]) },
    }
  }, async page => {
    await page.click('Solicitar')
    assert.deepEqual(calls, [['open'], ['send', 'Troca e devolução']])
    await page.click('Entrar no chat')
    assert.deepEqual(calls, [['open'], ['send', 'Troca e devolução'], ['open']])
  })
})

test('the legacy default API is selected as one object without borrowing methods from another candidate', async () => {
  const calls = []
  await withChatPage(oldCmsProps(), ({ window }) => {
    const legacy = {
      async open() { assert.equal(this, legacy); calls.push('legacy-open') },
      async send(message) { assert.equal(this, legacy); calls.push(message) },
    }
    window.WebChat = { open() { calls.push('incomplete-root-open') }, default: legacy }
  }, async page => {
    await page.click('Solicitar')
    assert.deepEqual(calls, ['legacy-open', 'Troca e devolução'])
  })
})

test('Solicitar still sends when the chat is already open', async () => {
  const calls = []
  await withChatPage(oldCmsProps(), ({ window, document }) => {
    const close = document.createElement('button')
    close.setAttribute('aria-label', 'Close chat')
    document.body.appendChild(close)
    window.WebChat = {
      open: async () => { calls.push('open') },
      send: async message => { calls.push(message) },
    }
  }, async page => {
    await page.click('Solicitar')
    assert.deepEqual(calls, ['open', 'Troca e devolução'])
  })
})

test('pending open and send operations prevent duplicate messages from repeated clicks', async () => {
  const opened = deferred()
  const sent = deferred()
  const calls = []
  await withChatPage(oldCmsProps(), ({ window }) => {
    window.WebChat = {
      open: () => { calls.push('open'); return opened.promise },
      send: message => { calls.push(message); return sent.promise },
    }
  }, async page => {
    await page.click('Solicitar')
    await page.click('Solicitar')
    assert.deepEqual(calls, ['open'])
    await page.flush(() => opened.resolve())
    assert.deepEqual(calls, ['open', 'Troca e devolução'])
    await page.click('Solicitar')
    assert.deepEqual(calls, ['open', 'Troca e devolução'])
    await page.flush(() => sent.resolve())
    assert.deepEqual(calls, ['open', 'Troca e devolução'])
  })
})

for (const failingOperation of ['open', 'send']) {
  test('a rejected ' + failingOperation + ' shows the existing error state without retrying or changing API candidates', async () => {
    const calls = []
    await withChatPage(oldCmsProps(), ({ window }) => {
      window.WebChat = {
        async open() { calls.push('open'); if (failingOperation === 'open') throw new Error('Unavailable') },
        async send() { calls.push('send'); throw new Error('Unavailable') },
        default: {
          open() { calls.push('unexpected-default-open') },
          send() { calls.push('unexpected-default-send') },
        },
      }
    }, async page => {
      await page.click('Solicitar')
      await page.flush(() => {})
      assert.deepEqual(calls, failingOperation === 'open' ? ['open'] : ['open', 'send'])
      assert.equal(page.document.querySelector('.status').textContent, getSettings().contacts.chatUnavailableMessage)
    })
  })
}

test('missing send API does not silently replace a message action with a launcher click', async () => {
  let launches = 0
  await withChatPage(oldCmsProps(), ({ document }) => {
    document.querySelector('.weni-launcher').addEventListener('click', () => { launches += 1 })
  }, async page => {
    await page.click('Solicitar')
    assert.equal(launches, 0)
    assert.equal(page.document.querySelector('.status').textContent, getSettings().contacts.chatUnavailableMessage)
  })
})

test('a contact without a phrase preserves launcher fallback and never toggles an already open chat', async () => {
  let launches = 0
  await withChatPage({}, ({ document }) => {
    document.querySelector('.weni-launcher').addEventListener('click', () => { launches += 1 })
  }, async page => {
    await page.click('Entrar no chat')
    assert.equal(launches, 1)
    const close = page.document.createElement('button')
    close.setAttribute('aria-label', 'Close chat')
    page.document.body.appendChild(close)
    await page.click('Entrar no chat')
    assert.equal(launches, 1)
    assert.equal(page.document.querySelector('.status'), null)
  })
})
