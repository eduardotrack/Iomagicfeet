const { test, before } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

let model
let getSchema
before(async () => {
  const { componentDir } = require('./test-paths.cjs')
  const source = fs.readFileSync(path.join(componentDir, 'model.js'), 'utf8')
  const modelUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  model = await import(modelUrl)
  const schemaSource = fs.readFileSync(path.join(componentDir, 'schema.js'), 'utf8')
    .replace("from './model'", `from '${modelUrl}'`)
  const schemaUrl = `data:text/javascript;base64,${Buffer.from(schemaSource).toString('base64')}`
  ;({ getSchema } = await import(schemaUrl))
})

const question = (pergunta, resposta = '', id) => ({ pergunta, resposta, ...(id ? { id } : {}) })

test('missing and malformed CMS props are safe during server rendering and never manufacture FAQs', () => {
  for (const input of [undefined, null, [], 'invalid', { cadastroendereco: null, pagamento: {} }]) {
    const categories = model.getCategories(input)
    assert.equal(categories.length, 9)
    assert.ok(categories.every(category => category.questions.length === 0))
    assert.deepEqual(model.filterCategories(categories, ''), [])
    assert.equal(model.getSettings(input).faq.initialQuestion, 'first')
  }
})

test('legacy props retain their persisted shape and Figma category order', () => {
  const response = '**Confira** [os pedidos](/account#/orders).\n\n- Primeiro\n- Segundo'
  const props = { cadastroendereco: [question('Como alterar o endereço?', response)] }
  const before = JSON.stringify(props)
  const categories = model.getCategories(props)
  assert.deepEqual(categories.map(category => category.id), ['cadastroendereco', 'cancelamento', 'devolucaoetroca', 'entrega', 'lojasefranquias', 'pagamento', 'produto', 'rastreamento', 'retiradaemloja'])
  assert.equal(categories[0].questions[0].resposta, response)
  assert.equal(categories[0].videoUrl, '')
  assert.equal(JSON.stringify(props), before)
})

test('legacy category presentation changes without copying or rewriting its questions', () => {
  const props = {
    pagamento: [question('Quais formas de pagamento?')],
    cadastroendereco: [question('Como alterar meu cadastro?')],
    legacyCategorySettings: [
      { id: 'pagamento', title: 'Pagar', icon: '/arquivos/pagar.svg', visible: false },
      { id: 'cadastroendereco', title: '', visible: true },
      { id: 'unknown', title: 'Ignore' },
      { id: 'pagamento', title: 'Duplicate ignored' },
    ],
  }
  const categories = model.getCategories(props)
  assert.equal(categories.length, 9)
  assert.equal(categories[0].id, 'pagamento')
  assert.equal(categories[0].title, 'Pagar')
  assert.equal(categories[0].visible, false)
  assert.equal(categories[0].icon, '/arquivos/pagar.svg')
  assert.equal(categories[1].title, 'Cadastro e Endereço')
  assert.deepEqual(model.filterCategories(categories, '').map(category => category.id), ['cadastroendereco'])
})

test('custom categories require an explicit mode and missing custom data falls back to legacy', () => {
  const legacy = { entrega: [question('Qual o prazo de entrega?')] }
  for (const input of [
    { ...legacy, categories: [] },
    { ...legacy, categories: [{ title: 'Not active', questions: [question('Ignore')] }] },
    { ...legacy, categorySource: 'custom' },
    { ...legacy, categorySource: 'custom', categories: null },
  ]) {
    assert.ok(model.getCategories(input).some(category => category.id === 'entrega' && category.questions.length === 1))
  }
  assert.deepEqual(model.getCategories({ ...legacy, categorySource: 'custom', categories: [] }), [])
})

test('custom mode uses a single content source, preserves ordering, and accepts extra categories', () => {
  const categories = model.getCategories({
    categorySource: 'custom',
    entrega: [question('Must not appear twice')],
    categories: [
      { id: 'new-category', title: 'Minha categoria', questions: [question('Nova pergunta', 'Nova resposta')] },
      { id: 'entrega', title: 'Entrega', questions: [question('Prazo', 'Veja o pedido')] },
    ],
  })
  assert.deepEqual(categories.map(category => category.id), ['new-category', 'entrega'])
  assert.equal(categories[1].questions.length, 1)
  assert.equal(categories[1].questions[0].pergunta, 'Prazo')
})

test('question IDs stay stable when CMS content is reordered and duplicates stay unique', () => {
  const a = question('Pergunta A', 'Resposta A')
  const b = question('Pergunta B', 'Resposta B')
  const read = questions => model.getCategories({ cadastroendereco: questions })[0].questions
  const first = read([a, b])
  const reordered = read([b, a])
  assert.equal(first[0].id, reordered[1].id)
  assert.equal(first[1].id, reordered[0].id)
  const duplicateIds = read([question('A', '', 'same'), question('B', '', 'same'), null, {}, question(' ')])
  assert.equal(duplicateIds.length, 2)
  assert.notEqual(duplicateIds[0].id, duplicateIds[1].id)
})

test('search ignores accents, whitespace, case, and Markdown destinations', () => {
  assert.equal(model.normalizeSearch('  DEVOLUÇÃO   E **Troca** '), 'devolucao e troca')
  assert.equal(model.normalizeSearch('[Meus pedidos](/nao-deve-ser-indexado) ![imagem](https://cdn.example/a.png)'), 'meus pedidos')
  assert.equal(model.normalizeSearch(null), '')
})

test('search finds words across category, question and rich answer without mutating content', () => {
  const categories = model.getCategories({
    devolucaoetroca: [question('Como solicitar?', '**Reembolso** em até dez dias úteis.'), question('Como embalar?', 'Use a caixa.')],
    pagamento: [question('Posso pagar?', 'Aceitamos cartão.')],
  })
  const before = JSON.stringify(categories)
  const results = model.filterCategories(categories, 'devolucao reembolso')
  assert.equal(results.length, 1)
  assert.equal(results[0].id, 'devolucaoetroca')
  assert.equal(results[0].questions.length, 1)
  assert.equal(results[0].questions[0].resposta, '**Reembolso** em até dez dias úteis.')
  assert.equal(JSON.stringify(categories), before)
  assert.deepEqual(model.filterCategories(categories, 'sem correspondência'), [])
})

test('search excludes hidden and empty categories even when the query is empty', () => {
  const categories = model.getCategories({
    categorySource: 'custom',
    categories: [
      { title: 'Visible', questions: [question('Existe?')] },
      { title: 'Hidden', visible: false, questions: [question('Existe?')] },
      { title: 'Empty', questions: [] },
      { title: 'Malformed', questions: [null, {}] },
    ],
  })
  assert.deepEqual(model.filterCategories(categories, ' ').map(category => category.title), ['Visible'])
})

test('safe actions allow store destinations and reject executable, relative-host and credential URLs', () => {
  for (const value of ['/nossas-lojas', '/account#/orders', '#faq', '?q=troca', 'https://example.com/faq', 'http://example.com']) {
    assert.equal(model.getSafeHref({ type: 'url', url: value }), value)
  }
  for (const value of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,test', '//evil.example', '/\\evil.example', 'https://user:password@example.com', 'https://', 'https://example.com/\nnext']) {
    assert.equal(model.getSafeHref({ type: 'url', url: value }), '')
  }
  assert.equal(model.getSafeHref({ type: 'chat', url: '' }), '')
  assert.equal(model.getSafeHref({ type: 'unknown', url: 'https://example.com' }), '')
})

test('the real contact destination stays valid when the rendering sandbox has no usable global URL constructor', () => {
  const original = global.URL
  const contact = model.getSettings().contacts.items.find(item => item.id === 'email')
  try {
    for (const unavailable of [undefined, class UnsupportedURL { constructor() { throw new Error('URL unavailable in render sandbox') } }]) {
      global.URL = unavailable
      assert.equal(model.getSafeHref(contact.action), 'https://authenticfeet.neoassist.com/?th=tag_vmagicfeetfixa&openEmail=1')
      assert.equal(model.getSafeHref({ type: 'url', url: 'https://user:password@example.com' }), '')
      assert.equal(model.getSafeHref({ type: 'url', url: 'https://example.com:99999' }), '')
      assert.equal(model.getSafeHref({ type: 'url', url: 'https://example.com:abc' }), '')
      assert.equal(model.getSafeHref({ type: 'url', url: '//evil.example' }), '')
    }
  } finally {
    global.URL = original
  }
})

test('email and telephone actions cannot inject headers or other URL schemes', () => {
  assert.equal(model.getSafeHref({ type: 'email', email: 'relacionamento@magicfeet.com.br' }), 'mailto:relacionamento@magicfeet.com.br')
  assert.equal(model.getSafeHref({ type: 'tel', phone: '(11) 2191-8391' }), 'tel:1121918391')
  assert.equal(model.getSafeHref({ type: 'tel', phone: '+55 (11) 2191-8391' }), 'tel:+551121918391')
  for (const email of ['test@example.com\r\nBcc:other@example.com', 'javascript:alert(1)', 'user@example.com?subject=bad']) {
    assert.equal(model.getSafeHref({ type: 'email', email }), '')
  }
  assert.equal(model.getSafeHref({ type: 'email', email: 'a?b@example.com' }), 'mailto:a%3Fb@example.com')
  for (const phone of ['javascript:alert(1)', '123', '11;ext=123', '12345678901234567']) {
    assert.equal(model.getSafeHref({ type: 'tel', phone }), '')
  }
})

test('settings merge partially edited CMS groups and respect explicit false, empty copy and empty lists', () => {
  const settings = model.getSettings({
    support: { title: '', items: [], initialSlide: 0 },
    banner: { visible: false },
    contacts: { visible: false, items: [] },
    faq: { initialQuestion: '', allowMultiple: true },
    search: { placeholder: 'Buscar', emptyDescription: '' },
  })
  assert.equal(settings.support.title, '')
  assert.deepEqual(settings.support.items, [])
  assert.equal(settings.support.initialSlide, 0)
  assert.equal(settings.banner.visible, false)
  assert.equal(settings.contacts.visible, false)
  assert.deepEqual(settings.contacts.items, [])
  assert.equal(settings.faq.initialQuestion, '')
  assert.equal(settings.faq.allowMultiple, true)
  assert.equal(settings.search.placeholder, 'Buscar')
  assert.equal(settings.search.emptyDescription, '')
  assert.equal(settings.search.emptyTitle, 'Nenhum FAQ encontrado para:')
})

test('settings are fresh, validated objects and cannot mutate exported defaults', () => {
  const first = model.getSettings()
  first.support.items[0].action.url = '/changed'
  assert.equal(model.getSettings().support.items[0].action.url, '/institucional/nossas-lojas')
  assert.equal(model.DEFAULT_SETTINGS.support.items[0].action.url, '/institucional/nossas-lojas')
  const settings = model.getSettings({
    appearance: { textColor: 'red;display:none', maxWidth: 99999 },
    banner: { desktopImage: 'javascript:alert(1)', positionDesktop: 'invalid' },
    faq: { categoryArrowIcon: 'data:image/svg+xml,<svg/>' },
  })
  assert.equal(settings.appearance.textColor, '#121416')
  assert.equal(settings.appearance.maxWidth, 1920)
  assert.equal(settings.banner.desktopImage, '')
  assert.equal(settings.banner.positionDesktop, 'center center')
  assert.equal(settings.faq.categoryArrowIcon, '')
  assert.equal(model.getSettings({ appearance: { maxWidth: null } }).appearance.maxWidth, 1471)
  assert.equal(model.getSettings({ support: { initialSlide: null } }).support.initialSlide, 1)
  assert.equal(model.getSettings({ contacts: { initialSlide: -1 } }).contacts.initialSlide, 0)
})

test('Site Editor shows only the active FAQ source without creating empty custom defaults', () => {
  const legacy = getSchema({ categorySource: 'legacy' })
  assert.equal(legacy.title, 'Magic Feet | Atendimento')
  assert.ok(legacy.properties.legacyCategorySettings)
  assert.ok(!legacy.properties.categories)
  for (const category of model.LEGACY_CATEGORIES) {
    assert.ok(legacy.properties[category.id])
    assert.ok(legacy.properties[category.id].items.properties.__editorItemTitle)
    assert.ok(!Object.hasOwn(legacy.properties[category.id], 'default'))
  }
  const custom = getSchema({ categorySource: 'custom' })
  assert.ok(custom.properties.categories)
  assert.ok(!Object.hasOwn(custom.properties.categories, 'default'))
  assert.ok(!custom.properties.legacyCategorySettings)
  assert.ok(!custom.properties.cadastroendereco)
  assert.equal(custom.properties.categories.items.properties.questions.items.properties.resposta.widget['ui:widget'], 'textarea')
})

test('Site Editor exposes all text, action, icon and accessible controls requested for the page', () => {
  const { properties } = getSchema()
  assert.ok(properties.support.properties.items.items.properties.action)
  assert.ok(properties.support.properties.initialSlide.minimum === 0)
  assert.ok(properties.search.properties.inputLabel)
  assert.ok(properties.search.properties.resultsLabel)
  assert.ok(properties.contacts.properties.chatUnavailableMessage)
  assert.equal(properties.contacts.properties.chatSelector.default, 'section.weni-launcher')
  assert.equal(properties.search.properties.icon.widget['ui:widget'], 'image-uploader')
  for (const name of ['categoryArrowIcon', 'activeCategoryArrowIcon', 'questionExpandIcon', 'questionCollapseIcon', 'questionArrowIcon']) {
    assert.equal(properties.faq.properties[name].widget['ui:widget'], 'image-uploader')
  }
})

test('both Figma chat actions use the verified launcher and the selector remains editable', () => {
  const settings = model.getSettings()
  assert.equal(settings.support.items.find(item => item.id === 'returns').action.type, 'chat')
  assert.equal(model.getSafeHref(settings.support.items.find(item => item.id === 'returns').action), '')
  assert.equal(settings.contacts.items.find(item => item.id === 'chat').action.type, 'chat')
  assert.equal(settings.contacts.chatSelector, 'section.weni-launcher')
  assert.equal(model.getSettings({ contacts: { chatSelector: '#new-launcher' } }).contacts.chatSelector, '#new-launcher')
  assert.equal(model.getSettings({ contacts: { chatSelector: '' } }).contacts.chatSelector, '')
})

test('banner crop defaults reproduce the Figma with or without editorial image overrides', () => {
  for (const props of [{}, { banner: { desktopImage: '/arquivos/desk.png', mobileImage: '/arquivos/mobile.png' } }]) {
    const { banner } = model.getSettings(props)
    assert.equal(banner.positionDesktop, 'center center')
    assert.equal(banner.positionMobile, 'center center')
  }
  const override = model.getSettings({ banner: { positionDesktop: 'right top', positionMobile: 'left bottom' } })
  assert.equal(override.banner.positionDesktop, 'right top')
  assert.equal(override.banner.positionMobile, 'left bottom')
  const fields = getSchema().properties.banner.properties
  assert.equal(fields.positionDesktop.default, 'center center')
  assert.equal(fields.positionMobile.default, 'center center')
  assert.equal(fields.positionDesktop.enum[0], 'center center')
  assert.equal(fields.positionMobile.enum[0], 'center center')
  assert.equal(fields.positionDesktop.enumNames[0], 'Original do Figma')
  assert.equal(fields.positionMobile.enumNames[0], 'Original do Figma')
})

test('flattened Site Editor fields keep section-specific labels without mutating shared schemas', () => {
  for (const source of ['legacy', 'custom']) {
    const { properties } = getSchema({ categorySource: source })
    for (const [group, prefix] of Object.entries({ banner: 'Banner', support: 'Apoio', search: 'Busca', faq: 'FAQ', contacts: 'Contatos', appearance: 'Aparência' })) {
      for (const field of Object.values(properties[group].properties)) assert.ok(field.title.startsWith(prefix + ' · '), field.title)
    }
    assert.equal(properties.support.properties.items.items.properties.action.properties.url.title, 'Apoio · Endereço da página ou do chat')
    assert.equal(properties.contacts.properties.items.items.properties.action.properties.url.title, 'Contatos · Endereço da página ou do chat')
    assert.equal(properties.categorySource.title, 'FAQ · Origem do conteúdo das categorias')
    if (source === 'legacy') assert.equal(properties.cadastroendereco.items.properties.pergunta.title, 'FAQ · Pergunta')
    else assert.equal(properties.categories.items.properties.questions.items.properties.pergunta.title, 'FAQ · Pergunta')
    properties.support.properties.items.items.properties.action.properties.url.title = 'Mutated'
    properties.support.properties.items.default[0].title = 'Mutated'
    const next = getSchema({ categorySource: source })
    assert.equal(next.support, undefined)
    assert.equal(next.properties.support.properties.items.items.properties.action.properties.url.title, 'Apoio · Endereço da página ou do chat')
    assert.equal(next.properties.support.properties.items.default[0].title, model.DEFAULT_SETTINGS.support.items[0].title)
    assert.equal(next.properties.contacts.properties.items.items.properties.action.properties.url.title, 'Contatos · Endereço da página ou do chat')
  }
})

test('editor names stay visible because image uploaders are nested below array items', () => {
  for (const source of ['legacy', 'custom']) {
    const { properties } = getSchema({ categorySource: source })
    const arrays = [
      properties.support.properties.items,
      properties.contacts.properties.items,
      source === 'custom' ? properties.categories : properties.legacyCategorySettings,
    ]
    for (const array of arrays) {
      const itemFields = array.items.properties
      assert.ok(itemFields.__editorItemTitle, 'The documented item-name contract remains available')
      assert.ok(!Object.values(itemFields).some(field => field.widget && field.widget['ui:widget'] === 'image-uploader'), 'Follow the official admin-pages title branch instead of its image-only preview branch')
      assert.equal(itemFields.visual.properties.icon.widget['ui:widget'], 'image-uploader')
      assert.ok(!Object.hasOwn(itemFields.visual.properties.icon, 'default'), 'Do not insert a blank override into previously saved content')
      assert.ok(!itemFields.icon, 'Do not expose a second confusing icon control')
    }
  }
})

test('nested icon overrides preserve legacy images and support explicitly clearing them', () => {
  const readSupportIcon = item => model.getSettings({ support: { items: [{ id: 'stores', title: 'Lojas', ...item }] } }).support.items[0].icon
  assert.equal(readSupportIcon({ icon: '/old.svg' }), '/old.svg')
  assert.equal(readSupportIcon({ icon: '/old.svg', visual: {} }), '/old.svg')
  assert.equal(readSupportIcon({ icon: '/old.svg', visual: { icon: '/new.svg' } }), '/new.svg')
  assert.equal(readSupportIcon({ icon: '/old.svg', visual: { icon: '' } }), '')
  assert.equal(readSupportIcon({ icon: '/old.svg', visual: { icon: 'javascript:alert(1)' } }), '')
  const legacy = model.getCategories({
    cadastroendereco: [{ pergunta: 'Minha pergunta', resposta: 'Minha resposta' }],
    legacyCategorySettings: [{ id: 'cadastroendereco', icon: '/old.svg', visual: { icon: '/new.svg' } }],
  })
  assert.equal(legacy[0].icon, '/new.svg')
  assert.equal(legacy[0].questions[0].pergunta, 'Minha pergunta')
  const custom = model.getCategories({ categorySource: 'custom', categories: [{ id: 'custom', title: 'Categoria', icon: '/old.svg', visual: { icon: '' }, questions: [] }] })
  assert.equal(custom[0].icon, '')
})

test('MF defaults preserve approved copy, contacts, colors and the initial orders support card', () => {
  const settings = model.getSettings()
  assert.equal(settings.banner.alt, 'Magic Feet — Central de Relacionamento')
  assert.equal(settings.support.items[0].title, 'Nossas lojas')
  assert.equal(settings.support.items[0].description, 'Encontre a loja mais próxima de você!')
  assert.equal(settings.support.initialSlide, 1)
  assert.equal(settings.contacts.initialSlide, 0)
  assert.equal(settings.search.title, 'Digite sua dúvida no campo abaixo')
  assert.equal(model.getSettings({ search: { title: 'Digite sua dúvina no campo abaixo' } }).search.title, settings.search.title)
  assert.equal(model.getSettings({ search: { title: 'Busque sua pergunta' } }).search.title, 'Busque sua pergunta')
  assert.equal(settings.search.placeholder, 'o que você procura?')
  assert.equal(model.LEGACY_CATEGORIES.find(item => item.id === 'pagamento').title, 'Pagamento')
  assert.equal(settings.contacts.items.find(item => item.id === 'email').action.email, 'relacionamento@magicfeet.com.br')
  assert.equal(settings.contacts.items.find(item => item.id === 'email').action.type, 'url')
  assert.equal(settings.contacts.items.find(item => item.id === 'email').action.url, 'https://authenticfeet.neoassist.com/?th=tag_vmagicfeetfixa&openEmail=1')
  assert.equal(settings.contacts.items.find(item => item.id === 'phone').action.phone, '1121918391')
  assert.deepEqual(settings.appearance, {
    textColor: '#121416', mutedColor: '#000000', surfaceColor: '#f8f9f9',
    activeColor: '#121416', borderColor: '#0a0a0a', accentColor: '#16dd05',
    paginationActiveIcon: '', paginationInactiveIcon: '', maxWidth: 1471,
  })
})

test('the MF mobile banner overlay is editable and does not inherit an image from another brand', () => {
  assert.equal(model.getSettings().banner.mobileOverlayImage, '')
  assert.equal(model.getSettings({ banner: { mobileOverlayImage: '/arquivos/mf-overlay.png' } }).banner.mobileOverlayImage, '/arquivos/mf-overlay.png')
  assert.equal(model.getSettings({ banner: { mobileOverlayImage: '' } }).banner.mobileOverlayImage, '')
  assert.equal(model.getSettings({ banner: { mobileOverlayImage: 'javascript:alert(1)' } }).banner.mobileOverlayImage, '')
  const fields = getSchema().properties.banner.properties
  assert.equal(fields.mobileOverlayImage.widget['ui:widget'], 'image-uploader')
  assert.ok(fields.mobileOverlayImage.title.startsWith('Banner · '))
  assert.equal(new Set(fields.positionDesktop.enum).size, fields.positionDesktop.enum.length)
  assert.equal(new Set(fields.positionMobile.enum).size, fields.positionMobile.enum.length)
})
