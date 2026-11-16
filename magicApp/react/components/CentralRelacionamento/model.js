// The existing nine prop names are a persisted Site Editor contract.
// Keep them as a read-compatible source until content is explicitly migrated.
export const LEGACY_CATEGORIES = [
  { id: 'cadastroendereco', title: 'Cadastro e Endereço' },
  { id: 'cancelamento', title: 'Cancelamento' },
  { id: 'devolucaoetroca', title: 'Devolução e Troca' },
  { id: 'entrega', title: 'Entrega' },
  { id: 'lojasefranquias', title: 'Lojas e Franquias' },
  { id: 'pagamento', title: 'Pagamento' },
  { id: 'produto', title: 'Produto' },
  { id: 'rastreamento', title: 'Rastreamento' },
  { id: 'retiradaemloja', title: 'Retirada em Loja' },
]

export const DEFAULT_SETTINGS = {
  banner: {
    desktopImage: '',
    mobileImage: '',
    mobileOverlayImage: '',
    alt: 'Magic Feet — Central de Relacionamento',
    href: '',
    visible: true,
    positionDesktop: 'center center',
    positionMobile: 'center center',
  },
  support: {
    title: 'Apoio ao Cliente',
    initialSlide: 1,
    carouselLabel: 'Atalhos de atendimento',
    previousLabel: 'Ver atalho anterior',
    nextLabel: 'Ver próximo atalho',
    items: [
      {
        id: 'stores',
        __editorItemTitle: 'Nossas lojas',
        title: 'Nossas lojas',
        description: 'Encontre a loja mais próxima de você!',
        visual: {},
        label: 'Buscar lojas',
        action: { type: 'url', url: '/institucional/nossas-lojas', newTab: false },
        visible: true,
      },
      {
        id: 'orders',
        __editorItemTitle: 'Acompanhar meu pedido',
        title: 'Acompanhar meu pedido',
        description: 'Para acompanhar a entrega do seu pedido é super fácil:',
        visual: {},
        label: 'Ver os pedidos',
        action: { type: 'url', url: '/account#/orders', newTab: false },
        visible: true,
      },
      {
        id: 'returns',
        __editorItemTitle: 'Troca e devolução',
        title: 'Troca e devolução',
        description:
          'Utilize o nosso chat para realizar a solicitação pelo nosso site.',
        visual: {},
        label: 'Solicitar',
        action: {
          type: 'chat',
          url: '',
          message: 'Troca e devolução',
          newTab: false,
        },
        visible: true,
      },
    ],
  },
  search: {
    title: 'Digite sua dúvida no campo abaixo',
    icon: '',
    placeholder: 'o que você procura?',
    emptyTitle: 'Nenhum FAQ encontrado para:',
    emptyDescription: '',
    clearLabel: 'Limpar busca',
    inputLabel: 'Buscar perguntas frequentes',
    resultsLabel: 'Resultados da Busca:',
  },
  faq: {
    title: 'Perguntas Frequentes',
    initialCategory: 'cadastroendereco',
    initialQuestion: 'first',
    allowMultiple: false,
    categoryArrowIcon: '',
    activeCategoryArrowIcon: '',
    questionExpandIcon: '',
    questionCollapseIcon: '',
    questionArrowIcon: '',
  },
  contacts: {
    title: 'Fale com a gente',
    initialSlide: 0,
    visible: true,
    chatSelector: 'section.weni-launcher',
    chatUnavailableMessage:
      'O chat está indisponível no momento. Entre em contato por e-mail ou telefone.',
    items: [
      {
        id: 'email',
        __editorItemTitle: 'E-mail',
        title: 'E-mail',
        visual: {},
        label: 'Enviar um e-mail',
        action: {
          type: 'url',
          url: 'https://authenticfeet.neoassist.com/?th=tag_vmagicfeetfixa&openEmail=1',
          email: 'relacionamento@magicfeet.com.br',
          newTab: true,
        },
        visible: true,
      },
      {
        id: 'chat',
        __editorItemTitle: 'Chat',
        title: 'Chat',
        visual: {},
        label: 'Entrar no chat',
        action: { type: 'chat', url: '', newTab: false },
        visible: true,
      },
      {
        id: 'phone',
        __editorItemTitle: 'Telefone',
        title: 'Telefone',
        visual: {},
        label: 'Ligar no telefone',
        action: { type: 'tel', phone: '1121918391', newTab: false },
        visible: true,
      },
    ],
  },
  appearance: {
    textColor: '#121416',
    mutedColor: '#000000',
    surfaceColor: '#f8f9f9',
    activeColor: '#121416',
    borderColor: '#0a0a0a',
    accentColor: '#16dd05',
    paginationActiveIcon: '',
    paginationInactiveIcon: '',
    maxWidth: 1471,
  },
}

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const asRecord = (value) => (isRecord(value) ? value : {})
const text = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback

const visible = (value, fallback = true) =>
  typeof value === 'boolean' ? value : fallback

const initialSlideIndex = (value, fallback) => {
  const index =
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim())
      ? Number(value)
      : NaN

  return Number.isInteger(index) && index >= 0 ? index : fallback
}

const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const POSITIONS = [
  'left top',
  'center top',
  'right top',
  'left center',
  'center center',
  'right center',
  'left bottom',
  'center bottom',
  'right bottom',
]

const hash = (value) => {
  let result = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }

  return (result >>> 0).toString(36)
}

const safeId = (value, fallback) => {
  const id = text(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')

  return id || fallback
}

const uniqueId = (base, used) => {
  let id = base
  let suffix = 2

  while (used.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }

  used.add(id)

  return id
}

// Restrict destinations to HTTP(S) and same-origin paths; never render script URLs.
const safeWebHref = (value) => {
  const href = text(value).trim()

  // Reject control characters in navigation destinations.
  // eslint-disable-next-line no-control-regex
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href)) return ''
  if (/^(?:\/[^/]|\/$|#|\?)/.test(href)) return href
  // The VTEX render sandbox may not expose the browser's URL constructor.
  // Validate the HTTP(S) authority directly so SSR and hydration emit the same
  // href. User information, missing hosts and invalid ports remain rejected.
  const absolute = /^https?:\/\/([^/?#]+)/i.exec(href)

  if (!absolute) return ''
  const host = /^(?:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.?|\[[a-f0-9:.]+\])(?::(\d{1,5}))?$/i.exec(
    absolute[1]
  )

  if (!host || (host[1] && Number(host[1]) > 65535)) return ''

  return href
}

export const getSafeHref = (action) => {
  if (typeof action === 'string') return safeWebHref(action)
  const item = asRecord(action)

  if (item.type === 'email') {
    const email = text(item.email).trim()

    return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(
      email
    )
      ? `mailto:${encodeURIComponent(email).replace(/%40/gi, '@')}`
      : ''
  }

  if (item.type === 'tel' || item.type === 'phone') {
    const raw = text(item.phone).trim()

    if (!/^\+?[\d\s().-]+$/.test(raw)) return ''
    const phone = raw.replace(/[\s().-]/g, '')

    return /^\+?\d{7,15}$/.test(phone) ? `tel:${phone}` : ''
  }

  if (item.type === 'url' || item.type === 'chat') return safeWebHref(item.url)

  return ''
}

const getAction = (value, fallback = {}) => {
  const input = asRecord(value)
  const output = { ...fallback, ...input }

  return {
    type: ['url', 'email', 'tel', 'phone', 'chat'].includes(output.type)
      ? output.type
      : 'url',
    url: text(output.url),
    email: text(output.email),
    phone: text(output.phone),
    message: text(output.message),
    newTab: visible(output.newTab, false),
  }
}

// A missing visual override preserves previously saved icon props. An explicit
// empty visual.icon clears that override and restores the original design asset.
const getItemIcon = (item) => {
  const visual = asRecord(item.visual)
  const value = Object.prototype.hasOwnProperty.call(visual, 'icon')
    ? visual.icon
    : item.icon

  return safeWebHref(value)
}

const getItems = (value, fallback) => {
  const input = Array.isArray(value) ? value : fallback
  const used = new Set()

  return input.filter(isRecord).map((item) => {
    const defaultItem = fallback.find((entry) => entry.id === item.id) || {}
    const title = text(item.title, text(defaultItem.title))

    return {
      id: uniqueId(
        safeId(item.id, `item-${hash(title + text(item.label))}`),
        used
      ),
      __editorItemTitle: text(item.__editorItemTitle, title),
      title,
      description: text(item.description, text(defaultItem.description)),
      icon: getItemIcon(item),
      label: text(item.label, text(defaultItem.label)),
      action: getAction(item.action, defaultItem.action),
      visible: visible(item.visible),
    }
  })
}

const getTextGroup = (value, defaults) => {
  const input = asRecord(value)

  return Object.keys(defaults).reduce((output, key) => {
    output[key] = text(input[key], defaults[key])

    return output
  }, {})
}

export const getSettings = (props = {}) => {
  const input = asRecord(props)
  const banner = asRecord(input.banner)
  const support = asRecord(input.support)
  const search = getTextGroup(input.search, DEFAULT_SETTINGS.search)
  const faq = asRecord(input.faq)
  const contacts = asRecord(input.contacts)
  const appearance = asRecord(input.appearance)
  const maxWidth =
    appearance.maxWidth === null || appearance.maxWidth === ''
      ? NaN
      : Number(appearance.maxWidth)

  return {
    banner: {
      desktopImage: safeWebHref(banner.desktopImage),
      mobileImage: safeWebHref(banner.mobileImage),
      mobileOverlayImage: safeWebHref(banner.mobileOverlayImage),
      alt: text(banner.alt, DEFAULT_SETTINGS.banner.alt),
      href: safeWebHref(banner.href),
      visible: visible(banner.visible),
      positionDesktop: POSITIONS.includes(banner.positionDesktop)
        ? banner.positionDesktop
        : DEFAULT_SETTINGS.banner.positionDesktop,
      positionMobile: POSITIONS.includes(banner.positionMobile)
        ? banner.positionMobile
        : DEFAULT_SETTINGS.banner.positionMobile,
    },
    support: {
      title: text(support.title, DEFAULT_SETTINGS.support.title),
      initialSlide: initialSlideIndex(
        support.initialSlide,
        DEFAULT_SETTINGS.support.initialSlide
      ),
      carouselLabel: text(
        support.carouselLabel,
        DEFAULT_SETTINGS.support.carouselLabel
      ),
      previousLabel: text(
        support.previousLabel,
        DEFAULT_SETTINGS.support.previousLabel
      ),
      nextLabel: text(support.nextLabel, DEFAULT_SETTINGS.support.nextLabel),
      items: getItems(support.items, DEFAULT_SETTINGS.support.items),
    },
    search: {
      ...search,
      // Site Editor may have saved the previous default with the typo.
      title:
        search.title === 'Digite sua dúvina no campo abaixo'
          ? DEFAULT_SETTINGS.search.title
          : search.title,
      icon: safeWebHref(asRecord(input.search).icon),
    },
    faq: {
      title: text(faq.title, DEFAULT_SETTINGS.faq.title),
      initialCategory: text(
        faq.initialCategory,
        DEFAULT_SETTINGS.faq.initialCategory
      ),
      initialQuestion: text(
        faq.initialQuestion,
        DEFAULT_SETTINGS.faq.initialQuestion
      ),
      allowMultiple: visible(faq.allowMultiple, false),
      categoryArrowIcon: safeWebHref(faq.categoryArrowIcon),
      activeCategoryArrowIcon: safeWebHref(faq.activeCategoryArrowIcon),
      questionExpandIcon: safeWebHref(faq.questionExpandIcon),
      questionCollapseIcon: safeWebHref(faq.questionCollapseIcon),
      questionArrowIcon: safeWebHref(faq.questionArrowIcon),
    },
    contacts: {
      title: text(contacts.title, DEFAULT_SETTINGS.contacts.title),
      initialSlide: initialSlideIndex(
        contacts.initialSlide,
        DEFAULT_SETTINGS.contacts.initialSlide
      ),
      visible: visible(contacts.visible),
      chatSelector: text(
        contacts.chatSelector,
        DEFAULT_SETTINGS.contacts.chatSelector
      ),
      chatUnavailableMessage: text(
        contacts.chatUnavailableMessage,
        DEFAULT_SETTINGS.contacts.chatUnavailableMessage
      ),
      items: getItems(contacts.items, DEFAULT_SETTINGS.contacts.items),
    },
    appearance: Object.keys(DEFAULT_SETTINGS.appearance).reduce(
      (output, key) => {
        output[key] =
          key === 'maxWidth'
            ? Number.isFinite(maxWidth)
              ? Math.max(960, Math.min(1920, maxWidth))
              : DEFAULT_SETTINGS.appearance.maxWidth
            : key.endsWith('Icon')
            ? safeWebHref(appearance[key])
            : COLOR.test(text(appearance[key]))
            ? appearance[key]
            : DEFAULT_SETTINGS.appearance[key]

        return output
      },
      {}
    ),
  }
}

const getQuestions = (value, categoryId) => {
  if (!Array.isArray(value)) return []
  const used = new Set()

  return value
    .filter((item) => isRecord(item) && text(item.pergunta).trim())
    .map((item) => {
      const pergunta = text(item.pergunta).trim()
      const resposta = text(item.resposta)

      return {
        id: uniqueId(
          safeId(
            item.id,
            `${categoryId}-q-${hash(`${pergunta}\n${resposta}`)}`
          ),
          used
        ),
        pergunta,
        resposta,
      }
    })
}

const getLegacyCategories = (props) => {
  const settings = Array.isArray(props.legacyCategorySettings)
    ? props.legacyCategorySettings.filter(isRecord)
    : []

  const defaultsById = LEGACY_CATEGORIES.reduce(
    (output, item) => ({ ...output, [item.id]: item }),
    {}
  )

  const order = []

  settings.concat(LEGACY_CATEGORIES).forEach((item) => {
    if (defaultsById[item.id] && !order.includes(item.id)) order.push(item.id)
  })

  return order.map((id) => {
    const defaults = defaultsById[id]
    const config = settings.find((item) => item.id === id) || {}

    return {
      id,
      title: text(config.title).trim() || defaults.title,
      icon: getItemIcon(config),
      questions: getQuestions(props[id], id),
      videoUrl: safeWebHref(config.videoUrl),
      videoTitle: text(config.videoTitle),
      visible: visible(config.visible),
    }
  })
}

export const getCategories = (props = {}) => {
  const input = asRecord(props)

  // A missing new source never erases existing CMS content. An explicitly saved
  // empty custom array, however, is respected after the user chooses this mode.
  if (input.categorySource !== 'custom' || !Array.isArray(input.categories))
    return getLegacyCategories(input)
  const used = new Set()

  return input.categories.filter(isRecord).map((item) => {
    const title = text(item.title, text(item.__editorItemTitle)).trim()
    const id = uniqueId(safeId(item.id, `category-${hash(title)}`), used)

    return {
      id,
      title,
      icon: getItemIcon(item),
      questions: getQuestions(item.questions, id),
      videoUrl: safeWebHref(item.videoUrl),
      videoTitle: text(item.videoTitle),
      visible: visible(item.visible),
    }
  })
}

export const normalizeSearch = (value) =>
  text(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[*_`~#>|]/g, ' ')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim()

export const filterCategories = (categories, query) => {
  if (!Array.isArray(categories)) return []
  const terms = normalizeSearch(query).split(' ').filter(Boolean)

  return categories
    .filter((item) => isRecord(item) && item.visible !== false)
    .map((category) => {
      const categoryText = normalizeSearch(category.title)
      const questions = (
        Array.isArray(category.questions) ? category.questions : []
      ).filter((question) => {
        if (!isRecord(question) || !text(question.pergunta).trim()) return false
        const haystack = `${categoryText} ${normalizeSearch(
          question.pergunta
        )} ${normalizeSearch(question.resposta)}`

        return terms.every((term) => haystack.includes(term))
      })

      return { ...category, questions }
    })
    .filter((category) => category.questions.length > 0)
}
