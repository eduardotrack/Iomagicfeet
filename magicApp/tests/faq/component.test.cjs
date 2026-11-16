const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')

// App components and theme assets have separate roots in the Magic monorepo.
const { themeRoot, componentDir, assetDir, getProjectRequire } = require('./test-paths.cjs')
const projectRequire = getProjectRequire()
const React = projectRequire('react')
const { renderToStaticMarkup } = projectRequire('react-dom/server')
const { JSDOM } = projectRequire('jsdom')
const babel = projectRequire('@babel/core')
const jsxPlugin = projectRequire('@babel/plugin-transform-react-jsx')
const modulesPlugin = projectRequire('@babel/plugin-transform-modules-commonjs')
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
    plugins: [jsxPlugin, modulesPlugin],
  })
  const testRequire = request => {
    if (request === 'vtex.css-handles') {
      return { useCssHandles: names => ({ handles: Object.fromEntries(names.map(name => [name, `handle-${name}`])) }) }
    }
    if (request === 'vtex.rich-text') {
      return { index: ({ text }) => React.createElement('div', { 'data-vtex-rich-text': true }, text) }
    }
    if (request === './styles.css') return { __esModule: true, default: styleNames }
    if (/\.(?:svg|png|jpe?g)$/.test(request)) {
      assert.fail('Images must be supplied by Store Framework staticAssets props, not React imports: ' + request)
    }
    if (request === './model' || request === './schema' || request === './assetDefaults') return readComponent(request.slice(2) + '.js')
    return projectRequire(request)
  }
  new Function('require', 'module', 'exports', code)(testRequire, module, module.exports)
  return module.exports
}

const Component = readComponent('index.jsx').default
const { LEGACY_CATEGORIES, getCategories } = readComponent('model.js')
const { ASSET_DEFAULTS } = readComponent('assetDefaults.js')
// Reproduce the size of the persisted Magic payload without shipping FAQ copy:
// 22 articles in nine arrays, including categories with a single article.
const articleCounts = { cadastroendereco: 3, cancelamento: 1, devolucaoetroca: 4, entrega: 2, lojasefranquias: 1, pagamento: 4, produto: 2, rastreamento: 1, retiradaemloja: 4 }
const fixture = () => Object.fromEntries(LEGACY_CATEGORIES.map(({ id }) => [id,
  Array.from({ length: articleCounts[id] }, (_, index) => ({
    id: `${id}-${['first', 'second', 'third', 'fourth'][index]}`,
    pergunta: index ? `Outra ${id} ${index + 1}` : `Pergunta ${id}`,
    resposta: index ? `Segunda resposta ${id} ${index + 1}.` : `Resposta **${id}** [pedidos](/account#/orders).`,
  })),
]))
const renderDocument = props => new JSDOM(renderToStaticMarkup(React.createElement(Component, props))).window.document

test('SSR renders all nine persisted categories, real CMS content and unique desktop/mobile IDs', () => {
  const props = fixture()
  const before = JSON.stringify(props)
  const document = renderDocument(props)
  const ids = Array.from(document.querySelectorAll('[id]'), element => element.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(document.querySelectorAll('.desktopFaq [id$="-category"]').length, 9)
  assert.equal(document.querySelectorAll('.mobileFaq [id$="-category"]').length, 9)
  assert.equal(getCategories(props).reduce((count, category) => count + category.questions.length, 0), 22, 'Every persisted Magic article reaches the model unchanged')
  assert.match(document.body.textContent, /Pergunta cadastroendereco/)
  assert.match(document.body.textContent, /Resposta \*\*cadastroendereco\*\* \[pedidos\]/)
  assert.equal(JSON.stringify(props), before)
  for (const control of document.querySelectorAll('[aria-controls]')) {
    assert.ok(document.getElementById(control.getAttribute('aria-controls')), `Missing panel for ${control.id || control.tagName}`)
  }
})

test('SSR initially opens exactly the first question of Cadastro e Endereço in both responsive versions', () => {
  const document = renderDocument(fixture())
  for (const variant of ['desktop', 'mobile']) {
    assert.equal(document.getElementById(`magicfeet-faq-${variant}-cadastroendereco-category`).getAttribute('aria-expanded'), 'true')
    const first = document.getElementById(`magicfeet-faq-${variant}-cadastroendereco--cadastroendereco-first-button`)
    const second = document.getElementById(`magicfeet-faq-${variant}-cadastroendereco--cadastroendereco-second-button`)
    assert.equal(first.getAttribute('aria-expanded'), 'true')
    assert.equal(second.getAttribute('aria-expanded'), 'false')
    assert.equal(document.getElementById(first.getAttribute('aria-controls')).hasAttribute('hidden'), false)
    assert.equal(document.getElementById(second.getAttribute('aria-controls')).hasAttribute('hidden'), true)
  }
})

test('SSR hides configured categories and safely falls back to the first available category', () => {
  const document = renderDocument({
    ...fixture(),
    cadastroendereco: null,
    legacyCategorySettings: [{ id: 'cancelamento', visible: false }],
  })
  assert.equal(document.getElementById('magicfeet-faq-desktop-cadastroendereco-category'), null)
  assert.equal(document.getElementById('magicfeet-faq-mobile-cancelamento-category'), null)
  assert.equal(document.getElementById('magicfeet-faq-desktop-devolucaoetroca-category').getAttribute('aria-expanded'), 'true')
})

test('SSR supports null CMS groups and explicit visibility without inventing question content or videos', () => {
  const document = renderDocument({
    banner: { visible: false },
    contacts: { visible: false },
    support: null,
    search: null,
    faq: null,
    cadastroendereco: null,
    entrega: [{ pergunta: null, resposta: null }],
  })
  assert.equal(document.querySelector('.banner'), null)
  assert.equal(document.querySelector('.contacts'), null)
  assert.equal(document.querySelectorAll('.question').length, 0)
  assert.equal(document.querySelector('iframe'), null)
  assert.equal(document.querySelector('input[type="search"]').getAttribute('aria-label'), 'Buscar perguntas frequentes')
})

test('SSR creates chat buttons and valid store, email and phone destinations', () => {
  const document = renderDocument(fixture())
  const buttons = Array.from(document.querySelectorAll('button'))
  assert.ok(buttons.some(button => button.textContent === 'Solicitar'))
  assert.ok(buttons.some(button => button.textContent === 'Entrar no chat'))
  assert.equal(document.querySelector('a[href="/institucional/nossas-lojas"]').textContent, 'Buscar lojas')
  assert.equal(document.querySelector('a[href="/account#/orders"]').textContent, 'Ver os pedidos')
  assert.equal(document.querySelector('a[href="https://authenticfeet.neoassist.com/?th=tag_vmagicfeetfixa&openEmail=1"]').textContent, 'Enviar um e-mail')
  assert.equal(document.querySelector('a[href="tel:1121918391"]').textContent, 'Ligar no telefone')
  assert.equal(document.querySelector('a[href^="javascript:"]'), null)
})

test('SSR emits the configured email form href before hydration even without a browser URL constructor', () => {
  const original = global.URL
  let html
  try {
    global.URL = undefined
    html = renderToStaticMarkup(React.createElement(Component, fixture()))
  } finally {
    global.URL = original
  }
  const document = new JSDOM(html).window.document
  const contact = document.querySelector('[data-contact-id="email"] a')
  assert.ok(contact)
  assert.equal(contact.getAttribute('href'), 'https://authenticfeet.neoassist.com/?th=tag_vmagicfeetfixa&openEmail=1')
  assert.equal(contact.getAttribute('aria-disabled'), null, 'The client should not need to repair a disabled SSR anchor')
  assert.equal(contact.getAttribute('target'), '_blank')
  assert.equal(contact.getAttribute('rel'), 'noopener noreferrer')
})

test('SSR respects explicit custom IDs, editor names, image overrides and source mode', () => {
  const document = renderDocument({
    categorySource: 'custom',
    categories: [{ id: 'custom', title: 'Minha categoria', questions: [{ id: 'question', pergunta: 'Pergunta customizada', resposta: 'Resposta customizada' }] }],
    cadastroendereco: fixture().cadastroendereco,
    banner: { desktopImage: '/arquivos/desk.png', mobileImage: '/arquivos/mobile.png', mobileOverlayImage: '/arquivos/overlay.png', alt: 'Banner configurado' },
    search: { icon: '/arquivos/search.svg', inputLabel: 'Busca configurada' },
    faq: { initialCategory: 'custom', questionArrowIcon: '/arquivos/arrow.svg' },
  })
  assert.equal(document.querySelectorAll('.desktopFaq [id$="-category"]').length, 1)
  assert.equal(document.getElementById('magicfeet-faq-desktop-custom-category').textContent, 'Minha categoria')
  assert.ok(!document.body.textContent.includes('Pergunta cadastroendereco'))
  assert.equal(document.querySelector('picture > img').getAttribute('src'), '/arquivos/desk.png')
  assert.equal(document.querySelector('picture > source').getAttribute('srcset'), '/arquivos/mobile.png')
  assert.equal(document.querySelector('.searchIcon img').getAttribute('src'), '/arquivos/search.svg')
  assert.equal(document.querySelector('.questionArrow img').getAttribute('src'), '/arquivos/arrow.svg')
  assert.ok(Component.getSchema({ categorySource: 'custom' }).properties.categories)
  assert.ok(!Component.getSchema({ categorySource: 'custom' }).properties.cadastroendereco)
})

test('client integration handles late CMS props, accordion selection, search and both chat paths', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><section class="weni-launcher"></section></body></html>', { url: 'https://faq--magicfeet.myvtex.com/institucional/atendimento' })
  const previous = { window: global.window, document: global.document, navigator: Object.getOwnPropertyDescriptor(global, 'navigator'), act: global.IS_REACT_ACT_ENVIRONMENT }
  global.window = dom.window
  global.document = dom.window.document
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
  global.IS_REACT_ACT_ENVIRONMENT = true
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  dom.window.HTMLElement.prototype.scrollBy = function scrollBy({ left }) { this.scrollLeft += left }
  const { createRoot } = projectRequire('react-dom/client')
  const { act } = React
  const root = createRoot(document.getElementById('app'))
  const click = async element => {
    assert.ok(element, 'Interaction target exists')
    await act(async () => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true })))
  }
  const typeSearch = async value => {
    const input = document.querySelector('input[type="search"]')
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(input, value)
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
  }
  try {
    await act(async () => root.render(React.createElement(Component, {})))
    assert.equal(document.querySelectorAll('.question').length, 0)
    const props = fixture()
    await act(async () => root.render(React.createElement(Component, props)))
    const firstId = 'magicfeet-faq-desktop-cadastroendereco--cadastroendereco-first-button'
    const secondId = 'magicfeet-faq-desktop-cadastroendereco--cadastroendereco-second-button'
    assert.equal(document.getElementById(firstId).getAttribute('aria-expanded'), 'true')
    await click(document.getElementById(secondId))
    assert.equal(document.getElementById(firstId).getAttribute('aria-expanded'), 'false')
    assert.equal(document.getElementById(secondId).getAttribute('aria-expanded'), 'true')
    await click(document.getElementById('magicfeet-faq-desktop-entrega-category'))
    assert.equal(document.getElementById('magicfeet-faq-desktop-entrega-category').getAttribute('aria-expanded'), 'true')
    await click(document.getElementById('magicfeet-faq-desktop-entrega-category'))
    assert.equal(document.getElementById('magicfeet-faq-desktop-entrega-category').getAttribute('aria-expanded'), 'true')
    await click(document.getElementById('magicfeet-faq-mobile-entrega-category'))
    assert.equal(document.getElementById('magicfeet-faq-mobile-entrega-category').getAttribute('aria-expanded'), 'false')
    await typeSearch('cadastroendereco')
    assert.equal(document.querySelectorAll('.resultGroup').length, 1)
    assert.match(document.querySelector('.resultGroup').textContent, /Cadastro e Endereço/)
    await typeSearch('sem-correspondencia')
    assert.match(document.querySelector('.empty').textContent, /Nenhum FAQ encontrado para:/)
    await typeSearch('')
    // An explicitly empty message keeps the legacy launcher-only action editable.
    await act(async () => root.render(React.createElement(Component, {
      ...props,
      support: { items: [{ id: 'returns', action: { type: 'chat', message: '' } }] },
    })))
    let launches = 0
    document.querySelector('.weni-launcher').addEventListener('click', () => { launches += 1 })
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Solicitar'))
    assert.equal(launches, 1)
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Entrar no chat'))
    assert.equal(launches, 2)
    const closeChat = document.createElement('button')
    closeChat.setAttribute('aria-label', 'Close chat')
    document.body.appendChild(closeChat)
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Solicitar'))
    assert.equal(launches, 2, 'An already open chat must not be toggled closed')
    closeChat.remove()
    document.querySelector('.weni-launcher').remove()
    await act(async () => root.render(React.createElement(Component, { ...props, contacts: { visible: false } })))
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Solicitar'))
    assert.match(document.querySelector('.status').textContent, /chat está indisponível/)
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    if (previous.window === undefined) delete global.window
    else global.window = previous.window
    if (previous.document === undefined) delete global.document
    else global.document = previous.document
    if (previous.navigator) Object.defineProperty(global, 'navigator', previous.navigator)
    else delete global.navigator
    if (previous.act === undefined) delete global.IS_REACT_ACT_ENVIRONMENT
    else global.IS_REACT_ACT_ENVIRONMENT = previous.act
  }
})

test('staticAssets CDN props supply every design asset through the Assets Builder contract', () => {
  const requiredKeys = ['bannerDesktop', 'bannerMobile', 'bannerMobileOverlay', 'storeIcon', 'searchIcon', 'mailMobileIcon']
  let declared
  if (process.env.MF_ASSET_MAP) {
    declared = JSON.parse(fs.readFileSync(process.env.MF_ASSET_MAP, 'utf8'))
  } else {
    const file = path.join(themeRoot, 'store/blocks/institucional/central-relacionamento/central-relacionamento.jsonc')
    const { parseConfigFileTextToJson } = projectRequire('typescript')
    const parsed = parseConfigFileTextToJson(file, fs.readFileSync(file, 'utf8'))
    assert.ok(!parsed.error, 'The relationship-center block is valid JSONC')
    const block = parsed.config['pd-CentralRelacionamento']
    assert.ok(block && block.props, 'Declare the component defaults in the theme')
    declared = block.props.staticAssets
  }
  assert.ok(declared && Object.keys(declared).length > 0, 'The MF theme declares its actual asset inventory')
  for (const key of requiredKeys) assert.ok(declared[key], 'Required MF design slot: ' + key)
  for (const key of Object.keys(ASSET_DEFAULTS)) assert.ok(declared[key], 'The theme declares fallback asset: ' + key)
  for (const [key, assetPath] of Object.entries(declared)) {
    assert.match(assetPath, /^assets\/img\/faq\/[^/]+\.(?:png|svg|jpe?g)$/)
    assert.ok(fs.statSync(path.join(assetDir, path.basename(assetPath))).size > 0, 'Nonempty Assets Builder file for ' + key)
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(themeRoot, 'manifest.json'), 'utf8'))
  const builderBase = 'https://magicfeet.vtexassets.com/assets/vtex/assets-builder/' + manifest.vendor + '.' + manifest.name + '/' + manifest.version + '/img/faq/'
  const staticAssets = Object.fromEntries(Object.entries(declared).map(([key, assetPath]) => [
    key,
    builderBase + path.basename(assetPath),
  ]))
  const document = renderDocument({ ...fixture(), staticAssets })
  assert.equal(document.querySelector('picture > img').getAttribute('src'), staticAssets.bannerDesktop)
  assert.equal(document.querySelector('picture > source').getAttribute('srcset'), staticAssets.bannerMobile)
  assert.equal(document.querySelector('.bannerMobileOverlay').getAttribute('src'), staticAssets.bannerMobileOverlay, 'The mobile banner overlay uses its separate editable design slot')
  assert.equal(document.querySelector('.supportIcon img').getAttribute('src'), staticAssets.storeIcon)
  assert.equal(document.querySelector('.searchIcon img').getAttribute('src'), staticAssets.searchIcon)
  assert.equal(document.querySelector('.categoryIcon img').getAttribute('src'), staticAssets.registrationIcon)
  assert.equal(document.querySelector('.questionArrowOpen img').getAttribute('src'), staticAssets.questionChevronOpen)
  assert.equal(document.querySelector('.mobileFaq .categorySelected .categoryArrow img').getAttribute('src'), staticAssets.categoryChevronMobileActive)
  assert.equal(document.querySelector('.contactIconDesktop').getAttribute('src'), staticAssets.mailIcon)
  assert.equal(document.querySelector('.contactIconMobile').getAttribute('src'), staticAssets.mailMobileIcon)
  assert.ok(Array.from(document.querySelectorAll('.questionArrow img')).some(img => img.getAttribute('src') === staticAssets.questionChevron), 'Closed questions retain the original closed chevron')
  const sources = Array.from(document.querySelectorAll('img[src], source[srcset]'), element => element.getAttribute('src') || element.getAttribute('srcset'))
  for (const key of ['bannerDesktop', 'bannerMobile', 'storeIcon', 'searchIcon']) assert.ok(sources.includes(staticAssets[key]), 'Rendered MF slot for asset ' + key)
  assert.ok(sources.every(url => url.startsWith('https://magicfeet.vtexassets.com/')))
  assert.ok(!sources.some(url => url.includes('/public/react/')))
})

test('missing or unsafe static assets use verified CDN fallbacks when old CMS props omit the map', () => {
  for (const staticAssets of [undefined, null, [], { bannerDesktop: 'javascript:alert(1)', searchIcon: 'data:image/svg+xml,test' }]) {
    const document = renderDocument({ ...fixture(), staticAssets })
    const sources = Array.from(document.querySelectorAll('img[src], source[srcset]'), element => element.getAttribute('src') || element.getAttribute('srcset'))
    assert.ok(sources.length > 0)
    for (const url of sources) {
      assert.ok(Object.values(ASSET_DEFAULTS).includes(url), 'Only immutable verified CDN fallbacks may be used')
      assert.ok(!url.includes('/public/react/'))
    }
    assert.equal(document.querySelector('picture > img').getAttribute('src'), ASSET_DEFAULTS.bannerDesktop)
    assert.equal(document.querySelector('.searchIcon img').getAttribute('src'), ASSET_DEFAULTS.searchIcon)
    assert.ok(!sources.includes(''))
  }
})

test('all declared MF CDN fallbacks match the MD5 of their original local Assets Builder files', () => {
  assert.ok(Object.keys(ASSET_DEFAULTS).length > 0, 'Validate the actual Magic Feet asset inventory')
  assert.ok(Object.isFrozen(ASSET_DEFAULTS))
  for (const [key, href] of Object.entries(ASSET_DEFAULTS)) {
    const url = new URL(href)
    assert.equal(url.origin, 'https://magicfeet.vtexassets.com')
    assert.ok(url.pathname.includes('/magicfeet.magictheme/'), 'Use the MF app identity rather than another brand CDN')
    const manifest = JSON.parse(fs.readFileSync(path.join(themeRoot, 'manifest.json'), 'utf8'))
    assert.ok(url.pathname.startsWith('/assets/vtex/assets-builder/' + manifest.vendor + '.' + manifest.name + '/' + manifest.version + '/img/faq/'), 'Fallback URLs must be generated for the current theme release')
    const match = url.pathname.match(new RegExp('/img/faq/(.+)___([a-f0-9]{32})([.](?:png|svg|jpe?g))$'))
    assert.ok(match, 'Hashed Assets Builder filename for ' + key)
    const file = path.join(assetDir, match[1] + match[3])
    const bytes = fs.readFileSync(file)
    assert.ok(bytes.length > 0, 'Original nonempty file for ' + key)
    assert.equal(createHash('md5').update(bytes).digest('hex'), match[2], 'Content hash matches the URL for ' + key)
  }
})

test('Site Editor API selects the live getSchema for the currently saved content source', () => {
  // Mirrors the selection order in official admin-pages getComponentSchema,
  // rather than calling getSchema directly and missing a static schema override.
  const resolveEditorSchema = props => Component.schema || (Component.getSchema && Component.getSchema(props, { routes: {} }))
  assert.equal(Component.schema, undefined, 'A static schema would hide getSchema in the actual Site Editor')
  assert.ok(resolveEditorSchema({ categorySource: 'custom' }).properties.categories)
  assert.ok(!resolveEditorSchema({ categorySource: 'custom' }).properties.cadastroendereco)
  assert.ok(resolveEditorSchema({ categorySource: 'legacy' }).properties.cadastroendereco)
})

test('mobile banner presets align both Figma layers to the visible clip and preserve the original default composition', () => {
  const original = renderDocument(fixture())
  assert.equal(original.querySelector('.bannerMobileBase').style.left, '-0.92%')
  assert.equal(original.querySelector('.bannerMobileBase').style.top, '-27.12%')
  assert.equal(original.querySelector('.bannerMobileOverlay').style.left, '-29.68%')
  assert.equal(original.querySelector('.bannerMobileOverlay').style.top, '-80.1%')

  const layers = [
    { selector: '.bannerMobileBase', width: 105.18, height: 150.44 },
    { selector: '.bannerMobileOverlay', width: 156.94, height: 224.46 },
  ]
  const closeTo = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} is aligned at ${expected}`)
  for (const horizontal of ['left', 'center', 'right']) {
    for (const vertical of ['top', 'center', 'bottom']) {
      if (horizontal === 'center' && vertical === 'center') continue
      const document = renderDocument({ ...fixture(), banner: { positionMobile: `${horizontal} ${vertical}` } })
      for (const layer of layers) {
        const element = document.querySelector(layer.selector)
        const imageLeft = Number.parseFloat(element.style.left)
        const imageTop = -82 + Number.parseFloat(element.style.top) * 344 / 100
        const imageHeight = layer.height * 344 / 100
        if (horizontal === 'left') closeTo(imageLeft, 0)
        if (horizontal === 'center') closeTo(imageLeft + layer.width / 2, 50)
        if (horizontal === 'right') closeTo(imageLeft + layer.width, 100)
        if (vertical === 'top') closeTo(imageTop, 0)
        if (vertical === 'center') closeTo(imageTop + imageHeight / 2, 90)
        if (vertical === 'bottom') closeTo(imageTop + imageHeight, 180)
      }
    }
  }
  const override = renderDocument({ banner: { mobileImage: '/arquivos/custom-mobile.jpg', positionMobile: 'right bottom' } })
  assert.equal(override.querySelector('.bannerMobile'), null, 'A complete mobile replacement retains its single-image positioning')
  assert.equal(override.querySelector('picture img').style.getPropertyValue('--faq-banner-mobile-position'), 'right bottom')
})

test('Site Editor initial FAQ edits update the preview while ordinary props preserve shopper selection and search', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://faq--magicfeet.myvtex.com/institucional/atendimento' })
  const previous = Object.fromEntries(['window', 'document', 'navigator', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]))
  Object.defineProperty(global, 'window', { value: dom.window, configurable: true, writable: true })
  Object.defineProperty(global, 'document', { value: dom.window.document, configurable: true, writable: true })
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
  Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true, writable: true })
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  const { createRoot } = projectRequire('react-dom/client')
  const { act } = React
  const root = createRoot(document.getElementById('app'))
  const render = async props => act(async () => root.render(React.createElement(Component, props)))
  const click = async element => act(async () => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true })))
  const search = async value => {
    const input = document.querySelector('input[type="search"]')
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value)
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
  }
  const question = (category, id, variant = 'desktop') => document.getElementById(`magicfeet-faq-${variant}-${category}--${category}-${id}-button`)
  const selected = () => document.querySelector('.desktopFaq .categorySelected')?.id
  try {
    let props = { ...fixture(), contacts: { visible: false }, faq: { initialCategory: 'cadastroendereco', initialQuestion: 'first' } }
    await render(props)
    await click(question('cadastroendereco', 'second'))
    props = { ...props, support: { title: 'Título editado' } }
    await render(props)
    assert.equal(question('cadastroendereco', 'second').getAttribute('aria-expanded'), 'true', 'An ordinary CMS text edit preserves the user-opened question')

    await search('pagamento')
    props = { ...props, faq: { initialCategory: 'pagamento', initialQuestion: 'pagamento-second' } }
    await render(props)
    assert.equal(document.querySelector('input[type="search"]').value, 'pagamento', 'Config edits do not clear an active search')
    assert.equal(question('pagamento', 'second', 'search').getAttribute('aria-expanded'), 'true')
    await search('')
    assert.equal(selected(), 'magicfeet-faq-desktop-pagamento-category')
    assert.equal(question('pagamento', 'second').getAttribute('aria-expanded'), 'true')

    await click(question('pagamento', 'first'))
    props = { ...props, faq: { ...props.faq, initialQuestion: '' } }
    await render(props)
    assert.equal(document.querySelectorAll('.desktopFaq .questionButton[aria-expanded="true"]').length, 0, 'An explicitly empty initial question is applied after shopper interactions')

    await click(document.getElementById('magicfeet-faq-desktop-produto-category'))
    props = { ...props, search: { title: 'Busca editada' } }
    await render(props)
    assert.equal(selected(), 'magicfeet-faq-desktop-produto-category', 'Unrelated props do not reset the shopper-selected category')
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(global, key, descriptor)
      else delete global[key]
    }
  }
})
