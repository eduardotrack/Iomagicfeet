const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const { componentDir, assetDir, getProjectRequire } = require('./test-paths.cjs')
const projectRequire = getProjectRequire()
const React = projectRequire('react')
const { JSDOM } = projectRequire('jsdom')
const babel = projectRequire('@babel/core')
const cache = new Map()
const styleNames = new Proxy({}, { get: (_, name) => typeof name === 'string' ? name : undefined })

const readComponent = fileName => {
  const file = path.join(componentDir, fileName)
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file,
    configFile: false,
    babelrc: false,
    plugins: [projectRequire('@babel/plugin-transform-react-jsx'), projectRequire('@babel/plugin-transform-modules-commonjs')],
  })
  const testRequire = request => {
    if (request === 'vtex.css-handles') return { useCssHandles: names => ({ handles: Object.fromEntries(names.map(name => [name, `handle-${name}`])) }) }
    if (request === 'vtex.rich-text') return { index: ({ text }) => React.createElement('div', null, text) }
    if (request === './styles.css') return { __esModule: true, default: styleNames }
    if (['./model', './schema', './assetDefaults'].includes(request)) return readComponent(`${request.slice(2)}.js`)
    return projectRequire(request)
  }
  new Function('require', 'module', 'exports', code)(testRequire, module, module.exports)
  return module.exports
}

const Component = readComponent('index.jsx').default
const { ASSET_DEFAULTS } = readComponent('assetDefaults.js')
const svgWidth = src => {
  const fileName = path.basename(new URL(src).pathname).replace(/___[a-f0-9]{32}(?=\.[^.]+$)/, '')
  const svg = fs.readFileSync(path.join(assetDir, fileName), 'utf8')
  const match = svg.match(/<svg\b[^>]*\bwidth="([^"]+)"/)
  assert.ok(match, 'The original pagination SVG declares its natural width')
  return Number(match[1])
}

test('MF mobile carousel keeps the original 8/24/8 dots synchronized with clicks, touch scrolling, arrows and resize', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://faq--magicfeet.myvtex.com/institucional/atendimento' })
  const previous = Object.fromEntries(['window', 'document', 'navigator', 'ResizeObserver', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]))
  const observers = []
  const scrollToCalls = []
  const scrollByCalls = []
  let viewport = 328
  Object.defineProperty(global, 'window', { value: dom.window, configurable: true, writable: true })
  Object.defineProperty(global, 'document', { value: dom.window.document, configurable: true, writable: true })
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
  Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true, writable: true })
  dom.window.matchMedia = query => ({ matches: query.includes('max-width') || query.includes('prefers-reduced-motion'), addEventListener() {}, removeEventListener() {} })
  const isTrack = element => element.classList.contains('supportTrack')
  const maxLeft = () => 2 * (viewport + 24)
  Object.defineProperties(dom.window.HTMLElement.prototype, {
    clientWidth: { configurable: true, get() { return isTrack(this) ? viewport : 0 } },
    scrollWidth: { configurable: true, get() { return isTrack(this) ? 3 * viewport + 48 : 0 } },
    offsetLeft: { configurable: true, get() {
      return this.parentElement && isTrack(this.parentElement)
        ? Array.from(this.parentElement.children).indexOf(this) * (viewport + 24)
        : 0
    } },
  })
  const scroll = (element, left) => {
    element.scrollLeft = Math.max(0, Math.min(maxLeft(), left))
    element.dispatchEvent(new window.Event('scroll', { bubbles: true }))
  }
  dom.window.HTMLElement.prototype.scrollTo = function scrollTo(options) {
    scrollToCalls.push(options)
    scroll(this, options.left)
  }
  dom.window.HTMLElement.prototype.scrollBy = function scrollBy(options) {
    scrollByCalls.push(options)
    scroll(this, this.scrollLeft + options.left)
  }
  Object.defineProperty(global, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: class {
      constructor(callback) { this.callback = callback }
      observe(element) { this.element = element; observers.push(this) }
      disconnect() {}
    },
  })
  const { createRoot } = projectRequire('react-dom/client')
  const { act } = React
  const root = createRoot(document.getElementById('app'))
  const props = { contacts: { visible: false } }
  const buttons = () => Array.from(document.querySelectorAll('.support .paginationButtons button'))
  const activeDot = () => buttons().findIndex(button => button.getAttribute('aria-current') === 'true')
  const assertPagination = index => {
    const dots = buttons()
    assert.equal(dots.length, 3)
    assert.equal(dots.filter(button => button.hasAttribute('aria-current')).length, 1)
    assert.equal(activeDot(), index)
    for (const [dotIndex, button] of dots.entries()) {
      assert.equal(button.type, 'button')
      assert.match(button.getAttribute('aria-label'), new RegExp('\\(' + (dotIndex + 1) + '/3\\)$'))
      assert.equal(button.querySelector('img').getAttribute('src'), dotIndex === index ? ASSET_DEFAULTS.paginationActiveIcon : ASSET_DEFAULTS.paginationInactiveIcon)
      assert.equal(button.querySelector('img').getAttribute('aria-hidden'), 'true')
    }
    assert.deepEqual(dots.map(button => svgWidth(button.querySelector('img').getAttribute('src'))), dots.map((_, dotIndex) => dotIndex === index ? 24 : 8))
  }
  try {
    await act(async () => root.render(React.createElement(Component, props)))
    const track = document.querySelector('.supportTrack')
    assert.ok(track)
    assert.equal(track.scrollLeft, 352, 'The initial mobile card is orders at index 1')
    assertPagination(1)
    assert.deepEqual(buttons().map(button => svgWidth(button.querySelector('img').getAttribute('src'))), [8, 24, 8])

    viewport = 356
    await act(async () => observers.forEach(observer => observer.callback([])))
    assert.equal(track.scrollLeft, 352, 'Resize preserves the existing scroll position')
    assertPagination(1)

    await act(async () => buttons()[2].dispatchEvent(new window.MouseEvent('click', { bubbles: true })))
    assert.equal(track.scrollLeft, 760)
    assert.deepEqual(scrollToCalls.at(-1), { left: 760, behavior: 'auto' })
    assertPagination(2)

    await act(async () => {
      track.scrollLeft = 10
      track.dispatchEvent(new window.Event('scroll', { bubbles: true }))
    })
    assertPagination(0)

    await act(async () => track.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
    assert.equal(scrollByCalls.at(-1).left, 356)
    assertPagination(1)
    await act(async () => track.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })))
    assertPagination(0)

    await act(async () => buttons()[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true })))
    assert.equal(track.scrollLeft, 380)
    assertPagination(1)
    viewport = 360
    const callsBeforeResize = scrollToCalls.length
    await act(async () => observers.forEach(observer => observer.callback([])))
    assert.equal(track.scrollLeft, 380, 'Resize after interaction must not reset the selected card')
    assert.equal(scrollToCalls.length, callsBeforeResize)
    assertPagination(1)

    await act(async () => root.render(React.createElement(Component, { ...props, support: { initialSlide: 0 } })))
    assert.equal(track.scrollLeft, 0, 'An explicit Site Editor initialSlide update is applied')
    assertPagination(0)
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(global, key, descriptor)
      else delete global[key]
    }
  }
})

test('desktop mount waits for the first mobile measurement before positioning the initial orders card', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://faq--magicfeet.myvtex.com/institucional/atendimento' })
  const previous = Object.fromEntries(['window', 'document', 'navigator', 'ResizeObserver', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]))
  const observers = []
  let mobile = false
  let viewport = 1200
  Object.defineProperty(global, 'window', { value: dom.window, configurable: true, writable: true })
  Object.defineProperty(global, 'document', { value: dom.window.document, configurable: true, writable: true })
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
  Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true, writable: true })
  dom.window.matchMedia = query => ({ matches: query.includes('max-width') ? mobile : true, addEventListener() {}, removeEventListener() {} })
  const isTrack = element => element.classList.contains('supportTrack')
  Object.defineProperties(dom.window.HTMLElement.prototype, {
    clientWidth: { configurable: true, get() { return isTrack(this) ? viewport : 0 } },
    scrollWidth: { configurable: true, get() { return isTrack(this) ? (mobile ? 3 * viewport + 48 : viewport) : 0 } },
    offsetLeft: { configurable: true, get() {
      return this.parentElement && isTrack(this.parentElement)
        ? Array.from(this.parentElement.children).indexOf(this) * (mobile ? viewport + 24 : 400)
        : 0
    } },
  })
  Object.defineProperty(global, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: class {
      constructor(callback) { this.callback = callback }
      observe(element) { this.element = element; observers.push(this) }
      disconnect() {}
    },
  })
  const { createRoot } = projectRequire('react-dom/client')
  const { act } = React
  const root = createRoot(document.getElementById('app'))
  const current = () => Array.from(document.querySelectorAll('.support .paginationButtons button')).findIndex(button => button.getAttribute('aria-current') === 'true')
  try {
    await act(async () => root.render(React.createElement(Component, { contacts: { visible: false } })))
    const track = document.querySelector('.supportTrack')
    assert.ok(track)
    assert.equal(track.scrollLeft, 0, 'Desktop mount does not scroll the grid')

    mobile = true
    viewport = 328
    await act(async () => observers.forEach(observer => observer.callback([])))
    assert.equal(track.scrollLeft, 352, 'The first mobile measurement positions default initialSlide=1')
    assert.equal(current(), 1, 'The active dot follows the initially selected orders card')

    await act(async () => {
      track.scrollLeft = 10
      track.dispatchEvent(new window.Event('scroll', { bubbles: true }))
    })
    assert.equal(current(), 0)
    viewport = 356
    await act(async () => observers.forEach(observer => observer.callback([])))
    assert.equal(track.scrollLeft, 10, 'Later mobile measurements preserve the visitor scroll position')
    assert.equal(current(), 0, 'Later mobile measurements do not restore the initial dot')
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(global, key, descriptor)
      else delete global[key]
    }
  }
})
