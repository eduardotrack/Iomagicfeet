const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')

const reactModules = path.join(__dirname, '../react')
const ts = require(require.resolve('typescript', { paths: [reactModules] }))
const source = fs.readFileSync(path.join(__dirname, '../react/components/NotifyUnavailableSku/NotifyModal.jsx'), 'utf8')
const compiled = ts.transpileModule(source, {
  fileName: 'NotifyModal.jsx',
  compilerOptions: {
    allowJs: true,
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
    esModuleInterop: true,
  },
}).outputText

function item(id, size, quantity, color = 'Preto') {
  return {
    itemId: id,
    variations: [{ name: 'Cor', values: [color] }, { name: 'Tamanho', values: [size] }],
    sellers: [{ commertialOffer: { AvailableQuantity: quantity } }],
  }
}

function fixture() {
  return {
    product: {
      skuSpecifications: [
        { field: { name: 'Cor' }, values: [{ name: 'Preto' }] },
        { field: { name: 'Tamanho' }, values: [{ name: '38' }, { name: '39' }] },
      ],
      items: [item('123', '38', 0), item('124', '39', 3)],
    },
    selectedItem: item('123', '38', 0),
  }
}

function setup({ product = fixture(), rootPath = '/', fetch = async () => ({ ok: true, json: async () => ({ success: true }) }) } = {}) {
  const state = []
  let cursor = 0
  let successes = 0
  let isOpen = true
  let nextTimer = 0
  const timers = new Map()
  const exports = {}
  const element = (type, props) => ({ type, props: props || {} })
  const context = {
    exports,
    React: {
      createElement(type, props, ...children) {
        return element(type, { ...props, children: children.length === 1 ? children[0] : children })
      },
    },
    fetch,
    setTimeout(callback, delay) {
      const id = ++nextTimer
      timers.set(id, { callback, delay })
      return id
    },
    clearTimeout(id) { timers.delete(id) },
    require(name) {
      if (name === 'react') return {
        useState(initial) {
          const index = cursor++
          if (!(index in state)) state[index] = initial
          return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
        },
        useEffect(effect, dependencies) {
          const index = cursor++
          const previous = state[index]
          if (!previous || dependencies.some((value, position) => value !== previous.dependencies[position])) {
            previous?.cleanup?.()
            state[index] = { dependencies, cleanup: effect() }
          }
        },
        useRef(initial) {
          const index = cursor++
          if (!(index in state)) state[index] = { current: initial }
          return state[index]
        },
      }
      if (name === 'react/jsx-runtime') return { jsx: element, jsxs: element }
      if (name === 'vtex.styleguide') return { EXPERIMENTAL_Modal: 'Modal' }
      if (name === 'vtex.product-context') return { useProduct: () => product }
      if (name === 'vtex.device-detector') return { useDevice: () => ({ device: 'desktop' }) }
      if (name === 'vtex.render-runtime') return { useRuntime: () => ({ rootPath }) }
      if (name === '../SimilarProductsShelf') return { SimilarProductsShelf: 'Shelf' }
      if (name === './styles.css') return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) }
      throw new Error(`Unexpected import ${name}`)
    },
  }
  vm.runInNewContext(compiled, context)

  function render() {
    cursor = 0
    return exports.NotifyModal({ isOpen, onClose() {}, onSuccess() { successes++ } })
  }
  function nodes(tree = render()) {
    const result = []
    function walk(node) {
      if (!node || typeof node !== 'object') return
      result.push(node)
      const children = node.props?.children
      ;(Array.isArray(children) ? children.flat(Infinity) : [children]).forEach(walk)
    }
    walk(tree)
    return result
  }
  function find(type, predicate = () => true) {
    return nodes().find((node) => node.type === type && predicate(node.props))
  }
  function fill() {
    find('input', (props) => props.name === 'name').props.onChange({ target: { value: '  Maria Silva  ' } })
    find('input', (props) => props.name === 'email').props.onChange({ target: { value: '  maria@example.com ' } })
    find('button', (props) => props.children === '38').props.onClick()
    find('input', (props) => props.type === 'checkbox').props.onChange({ target: { checked: true } })
  }
  return {
    render, nodes, find, fill, successes: () => successes,
    setOpen(value) { isOpen = value; render(); return render() },
    timers: () => [...timers.values()],
    runTimers() {
      const pending = [...timers.values()]
      timers.clear()
      pending.forEach(({ callback }) => callback())
    },
  }
}

test('shows only unavailable sizes for the selected color, even when size is not the first specification', () => {
  const product = fixture()
  product.product.items.push(item('125', '40', 0, 'Branco'))
  product.product.items.push(item('126', '41', undefined))
  const ui = setup({ product })
  const labels = ui.nodes().filter((node) => node.type === 'button').map((node) => node.props.children)
  assert(labels.includes('38'))
  assert(!labels.includes('39'))
  assert(!labels.includes('40'))
  assert(!labels.includes('41'))
})

test('handles a missing product context without crashing or allowing submission', () => {
  const ui = setup({ product: null })
  assert.equal(ui.find('button', (props) => props.type === 'submit').props.disabled, true)
})

test('preserves Magicfeet branding, subtitle, and size-wrapper layout', () => {
  const ui = setup()
  const texts = ui.nodes().flatMap((node) => {
    const children = node.props?.children
    return Array.isArray(children) ? children.flat(Infinity) : [children]
  }).filter((value) => typeof value === 'string')
  assert(texts.includes('Veja os produtos disponíveis'))
  assert(texts.some((value) => value.includes('magicfeet')))
  assert(!texts.some((value) => /Artwalk|Authentic Feet/.test(value)))
  assert(ui.find('div', (props) => props.className === 'notifyUnavailableToggleWrapper'))
})

test('keeps the modal visible for the existing closing animation and cancels it when reopened', () => {
  const ui = setup()
  assert.equal(ui.render().props.isOpen, true)
  const closing = ui.setOpen(false)
  assert.equal(closing.props.isOpen, true)
  assert(closing.props.className.includes('notifyUnavailableModalClosing'))
  assert.equal(ui.timers().length, 1)
  assert.equal(ui.timers()[0].delay, 200)
  ui.runTimers()
  assert.equal(ui.render().props.isOpen, false)
  assert.equal(ui.setOpen(true).props.isOpen, true)
  ui.setOpen(false)
  assert.equal(ui.timers().length, 1)
  assert.equal(ui.setOpen(true).props.isOpen, true)
  assert.equal(ui.timers().length, 0)
  ui.runTimers()
  assert.equal(ui.render().props.isOpen, true)
})

test('submits normalized values and consent to the binding route, clearing only on confirmed success', async () => {
  let request
  const ui = setup({ rootPath: '/br/', fetch: async (url, options) => {
    request = { url, options }
    return { ok: true, json: async () => ({ success: true }) }
  } })
  ui.fill()
  await ui.find('form').props.onSubmit({ preventDefault() {} })
  assert.equal(request.url, '/br/_v/avise-me')
  assert.deepEqual(JSON.parse(request.options.body), {
    name: 'Maria Silva', email: 'maria@example.com', skuId: '123', acceptTerms: true,
  })
  assert.equal(ui.successes(), 1)
  assert.equal(ui.find('input', (props) => props.name === 'name').props.value, '')
})

for (const [label, fetch] of [
  ['HTTP 403', async () => ({ ok: false, status: 403 })],
  ['unconfirmed response', async () => ({ ok: true, json: async () => ({ success: false }) })],
  ['invalid JSON', async () => ({ ok: true, json: async () => { throw new Error('invalid json') } })],
  ['network failure', async () => { throw new Error('network') }],
]) {
  test(`preserves fields and shows an error after ${label}`, async () => {
    const ui = setup({ fetch })
    ui.fill()
    await ui.find('form').props.onSubmit({ preventDefault() {} })
    assert.equal(ui.successes(), 0)
    assert.equal(ui.find('input', (props) => props.name === 'name').props.value, '  Maria Silva  ')
    assert.equal(ui.find('input', (props) => props.type === 'checkbox').props.checked, true)
    assert(ui.find('span', (props) => props.role === 'alert'))
  })
}

test('blocks duplicate concurrent submissions and disables fields while saving', async () => {
  let release
  let requests = 0
  const ui = setup({ fetch: () => {
    requests++
    return new Promise((resolve) => { release = resolve })
  } })
  ui.fill()
  const submit = ui.find('form').props.onSubmit
  const pending = submit({ preventDefault() {} })
  await submit({ preventDefault() {} })
  assert.equal(requests, 1)
  assert.equal(ui.find('input', (props) => props.name === 'name').props.disabled, true)
  release({ ok: true, json: async () => ({ success: true }) })
  await pending
  assert.equal(ui.successes(), 1)
})

test('rejects invalid email, whitespace name, and missing consent without calling the backend', async () => {
  let requests = 0
  const ui = setup({ fetch: async () => { requests++; return {} } })
  ui.find('input', (props) => props.name === 'name').props.onChange({ target: { value: '   ' } })
  ui.find('input', (props) => props.name === 'email').props.onChange({ target: { value: 'invalid' } })
  await ui.find('form').props.onSubmit({ preventDefault() {} })
  assert.equal(requests, 0)
  assert.equal(ui.successes(), 0)
})
