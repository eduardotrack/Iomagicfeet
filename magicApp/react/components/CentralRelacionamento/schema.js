import { DEFAULT_SETTINGS, LEGACY_CATEGORIES } from './model'

const stringField = (title, defaultValue = '', description = '') => ({
  title,
  type: 'string',
  default: defaultValue,
  ...(description ? { description } : {}),
})

const imageField = (title) => ({
  ...stringField(title),
  widget: { 'ui:widget': 'image-uploader' },
})

// ArrayFieldTemplateItem in vtex.admin-pages switches to image-only preview
// whenever an immediate item property is image-uploader. Keep the upload inside
// this object so the editor renders __editorItemTitle for the closed array row.
// No default here: opening old CMS content must not erase its legacy icon prop.
const visualField = (title) => ({
  title: 'Imagem do item',
  type: 'object',
  properties: {
    icon: {
      title,
      type: 'string',
      widget: { 'ui:widget': 'image-uploader' },
    },
  },
})

const visibleField = (title = 'Exibir', defaultValue = true) => ({
  title,
  type: 'boolean',
  default: defaultValue,
})

const objectField = (title, properties, description) => ({
  title,
  type: 'object',
  properties,
  ...(description ? { description } : {}),
})

// Five positional parts mirror the array schema contract used by all editor lists.
/* eslint-disable max-params -- The schema list factory receives its five explicit parts. */
const listField = (
  title,
  itemTitle,
  properties,
  description,
  defaultValue
) => ({
  title,
  type: 'array',
  minItems: 0,
  items: objectField(itemTitle, properties),
  ...(description ? { description } : {}),
  ...(defaultValue !== undefined ? { default: defaultValue } : {}),
})
/* eslint-enable max-params */

const editorTitle = stringField(
  'Nome do item no editor',
  '',
  'Identificação interna da lista; não aparece na página.'
)

const idField = stringField(
  'Identificador estável',
  '',
  'Use letras sem acento, números e hífens. Mantenha o mesmo identificador ao reordenar ou editar o item.'
)

const POSITION_PRESETS = [
  ['left top', 'Superior esquerdo'],
  ['center top', 'Superior central'],
  ['right top', 'Superior direito'],
  ['left center', 'Centro esquerdo'],
  ['center center', 'Centro'],
  ['right center', 'Centro direito'],
  ['left bottom', 'Inferior esquerdo'],
  ['center bottom', 'Inferior central'],
  ['right bottom', 'Inferior direito'],
]

const positionField = (title, originalPosition) => {
  const presets = POSITION_PRESETS.filter(
    ([value]) => value !== originalPosition
  )

  return {
    title,
    type: 'string',
    default: originalPosition,
    enum: [originalPosition, ...presets.map(([value]) => value)],
    enumNames: ['Original do Figma', ...presets.map(([, label]) => label)],
  }
}

const actionField = objectField('Ação do botão', {
  type: {
    title: 'Tipo de ação',
    type: 'string',
    default: 'url',
    enum: ['url', 'email', 'tel', 'chat'],
    enumNames: [
      'Abrir página ou link',
      'Enviar e-mail',
      'Ligar no telefone',
      'Abrir chat',
    ],
  },
  url: stringField(
    'Endereço da página ou do chat',
    '',
    'Use /caminho para páginas da loja ou https:// para endereços externos. No chat, deixe vazio para usar a integração da loja.'
  ),
  email: stringField(
    'E-mail de destino',
    '',
    'Preencha quando a ação for Enviar e-mail. Informe somente o endereço, sem mailto:.'
  ),
  phone: stringField(
    'Telefone de destino',
    '',
    'Preencha quando a ação for Ligar no telefone. Inclua DDD e, quando necessário, código do país.'
  ),
  message: {
    title: 'Mensagem inicial enviada ao abrir o chat',
    description:
      'Usada somente na ação Abrir chat. A mensagem é enviada ao clicar no botão, inclusive em conversas já abertas. Deixe vazio para apenas abrir o chat.',
    type: 'string',
    widget: { 'ui:widget': 'textarea' },
  },
  newTab: visibleField('Abrir link em nova aba', false),
})

const questionFields = {
  __editorItemTitle: editorTitle,
  id: idField,
  pergunta: stringField('Pergunta'),
  resposta: {
    ...stringField(
      'Resposta',
      '',
      'Aceita o mesmo Markdown do conteúdo atual: links, listas, negrito e parágrafos.'
    ),
    widget: { 'ui:widget': 'textarea' },
  },
}

const questionList = (title) =>
  listField(
    title,
    'Pergunta e resposta',
    questionFields,
    'Arraste os itens para alterar a ordem. Não remova o conteúdo antes de conferir a página no workspace faq.'
  )

const categoryFields = {
  __editorItemTitle: editorTitle,
  id: idField,
  title: stringField('Nome da categoria'),
  visual: visualField('Ícone da categoria'),
  visible: visibleField('Exibir categoria'),
  questions: questionList('Perguntas desta categoria'),
  videoUrl: stringField(
    'Vídeo opcional — URL incorporável',
    '',
    'Deixe vazio para seguir o Figma, que não apresenta vídeo. Quando preenchido, utilize a URL incorporável do YouTube ou Vimeo.'
  ),
  videoTitle: stringField('Título acessível do vídeo'),
}

const supportItemFields = {
  __editorItemTitle: editorTitle,
  id: idField,
  visible: visibleField('Exibir atalho'),
  title: stringField('Título do atalho'),
  description: {
    ...stringField('Descrição do atalho'),
    widget: { 'ui:widget': 'textarea' },
  },
  visual: visualField('Ícone do atalho'),
  label: stringField('Texto do botão'),
  action: actionField,
}

const contactItemFields = {
  __editorItemTitle: editorTitle,
  id: idField,
  visible: visibleField('Exibir canal'),
  title: stringField('Nome do canal'),
  visual: visualField('Ícone do canal'),
  label: stringField('Texto do botão'),
  action: actionField,
}

const commonProperties = () => ({
  banner: objectField(
    '01 · Banner principal',
    {
      visible: visibleField('Exibir banner'),
      desktopImage: imageField('Imagem — Desktop'),
      mobileImage: imageField('Imagem — Mobile'),
      mobileOverlayImage: imageField('Imagem de sobreposição — Mobile'),
      alt: stringField(
        'Descrição acessível da imagem',
        DEFAULT_SETTINGS.banner.alt
      ),
      href: stringField('Link opcional do banner'),
      positionDesktop: positionField(
        'Enquadramento — Desktop',
        DEFAULT_SETTINGS.banner.positionDesktop
      ),
      positionMobile: positionField(
        'Enquadramento — Mobile',
        DEFAULT_SETTINGS.banner.positionMobile
      ),
    },
    'As imagens vazias usam os arquivos originais do Figma incluídos no app.'
  ),
  support: objectField('02 · Apoio ao cliente', {
    title: stringField('Título da seção', DEFAULT_SETTINGS.support.title),
    items: listField(
      'Atalhos de atendimento',
      'Atalho',
      supportItemFields,
      'Arraste para reordenar. Cada item possui título, descrição, ícone, botão e ação próprios.',
      DEFAULT_SETTINGS.support.items
    ),
    initialSlide: {
      title: 'Atalho inicial no mobile (0 = primeiro)',
      type: 'integer',
      minimum: 0,
      maximum: 99,
      default: DEFAULT_SETTINGS.support.initialSlide,
    },
    carouselLabel: stringField(
      'Nome acessível do carrossel',
      DEFAULT_SETTINGS.support.carouselLabel
    ),
    previousLabel: stringField(
      'Rótulo acessível — Atalho anterior',
      DEFAULT_SETTINGS.support.previousLabel
    ),
    nextLabel: stringField(
      'Rótulo acessível — Próximo atalho',
      DEFAULT_SETTINGS.support.nextLabel
    ),
  }),
  search: objectField('03 · Busca de perguntas', {
    title: stringField('Título acima da busca', DEFAULT_SETTINGS.search.title),
    icon: imageField('Ícone da busca'),
    placeholder: stringField(
      'Texto de exemplo no campo',
      DEFAULT_SETTINGS.search.placeholder
    ),
    inputLabel: stringField(
      'Nome acessível do campo',
      DEFAULT_SETTINGS.search.inputLabel
    ),
    resultsLabel: stringField(
      'Título dos resultados',
      DEFAULT_SETTINGS.search.resultsLabel
    ),
    emptyTitle: stringField(
      'Texto quando não há resultados',
      DEFAULT_SETTINGS.search.emptyTitle
    ),
    emptyDescription: {
      ...stringField(
        'Complemento opcional sem resultados',
        DEFAULT_SETTINGS.search.emptyDescription
      ),
      widget: { 'ui:widget': 'textarea' },
    },
    clearLabel: stringField(
      'Texto acessível — Limpar busca',
      DEFAULT_SETTINGS.search.clearLabel
    ),
  }),
  faq: objectField('04 · Perguntas frequentes — Apresentação', {
    title: stringField('Título da seção', DEFAULT_SETTINGS.faq.title),
    initialCategory: stringField(
      'Categoria inicialmente aberta',
      DEFAULT_SETTINGS.faq.initialCategory,
      'Informe o identificador da categoria. Se ela estiver vazia ou oculta, será usada a primeira categoria disponível.'
    ),
    initialQuestion: stringField(
      'Pergunta inicialmente aberta',
      DEFAULT_SETTINGS.faq.initialQuestion,
      'Use first para abrir a primeira pergunta, um identificador de pergunta ou deixe vazio para começar com todas fechadas.'
    ),
    allowMultiple: visibleField('Permitir várias perguntas abertas', false),
    categoryArrowIcon: imageField('Ícone da seta — Categoria fechada'),
    activeCategoryArrowIcon: imageField(
      'Ícone da seta — Categoria selecionada'
    ),
    questionExpandIcon: imageField('Ícone — Abrir pergunta'),
    questionCollapseIcon: imageField('Ícone — Fechar pergunta'),
    questionArrowIcon: imageField('Ícone da seta das perguntas — Desktop'),
  }),
  categorySource: {
    title: '04.1 · Origem do conteúdo das categorias',
    description:
      'Conteúdo atual mantém as nove listas já salvas. Categorias personalizadas permitem criar/remover categorias e devem ser usadas somente após copiar e conferir todo o conteúdo atual; trocar esta opção não migra o CMS automaticamente.',
    type: 'string',
    default: 'legacy',
    enum: ['legacy', 'custom'],
    enumNames: [
      'Conteúdo atual — Preservar listas existentes',
      'Categorias personalizadas — Conteúdo migrado',
    ],
  },
})

const contactAndAppearanceProperties = () => ({
  contacts: objectField('05 · Fale com a gente', {
    visible: visibleField('Exibir seção de contatos'),
    title: stringField('Título da seção', DEFAULT_SETTINGS.contacts.title),
    initialSlide: {
      title: 'Canal inicial no mobile (0 = primeiro)',
      type: 'integer',
      minimum: 0,
      maximum: 99,
      default: DEFAULT_SETTINGS.contacts.initialSlide,
    },
    items: listField(
      'Canais de atendimento',
      'Canal de atendimento',
      contactItemFields,
      'Arraste para alterar a ordem. Configure cada destino no grupo Ação do botão.',
      DEFAULT_SETTINGS.contacts.items
    ),
    chatSelector: stringField(
      'Seletor do botão de chat da loja',
      DEFAULT_SETTINGS.contacts.chatSelector,
      'Seletor CSS do launcher já instalado. O padrão section.weni-launcher deve corresponder ao launcher instalado na Magic Feet. Altere somente se a integração da loja mudar; nenhuma mensagem é enviada automaticamente.'
    ),
    chatUnavailableMessage: {
      ...stringField(
        'Aviso quando o chat não está disponível',
        DEFAULT_SETTINGS.contacts.chatUnavailableMessage
      ),
      widget: { 'ui:widget': 'textarea' },
    },
  }),
  appearance: objectField(
    '06 · Aparência — Configurações avançadas',
    {
      textColor: stringField(
        'Cor dos títulos e textos principais',
        DEFAULT_SETTINGS.appearance.textColor,
        'Cor hexadecimal, por exemplo #121416.'
      ),
      mutedColor: stringField(
        'Cor dos textos secundários',
        DEFAULT_SETTINGS.appearance.mutedColor
      ),
      surfaceColor: stringField(
        'Cor do fundo da busca e resposta aberta',
        DEFAULT_SETTINGS.appearance.surfaceColor
      ),
      activeColor: stringField(
        'Cor da categoria selecionada',
        DEFAULT_SETTINGS.appearance.activeColor
      ),
      borderColor: stringField(
        'Cor das bordas',
        DEFAULT_SETTINGS.appearance.borderColor
      ),
      accentColor: stringField(
        'Cor de destaque',
        DEFAULT_SETTINGS.appearance.accentColor
      ),
      maxWidth: {
        title: 'Largura máxima do conteúdo — Desktop (px)',
        type: 'integer',
        minimum: 960,
        maximum: 1920,
        default: DEFAULT_SETTINGS.appearance.maxWidth,
      },
      paginationActiveIcon: imageField('Carrosséis · Indicador selecionado'),
      paginationInactiveIcon: imageField(
        'Carrosséis · Indicador não selecionado'
      ),
    },
    'Os valores iniciais reproduzem o Figma. Alterá-los muda a aparência da página.'
  ),
})

// Site Editor can flatten object groups. Prefix every child label so it
// remains identifiable even when the group's own title is not displayed.
// Clone the complete section, including shared action/item schemas and defaults.
const withSectionLabels = (field, prefix) => {
  const cloned = JSON.parse(JSON.stringify(field))
  const label = (node, keepTitle = false) => {
    if (!keepTitle && typeof node.title === 'string') {
      const title = node.title.replace(/^[0-9.]+[ ]*·[ ]*/, '')

      node.title = [prefix, title].join(' · ')
    }

    if (node.properties)
      Object.keys(node.properties).forEach((key) => label(node.properties[key]))
    if (node.items) label(node.items)
  }

  label(cloned, cloned.type === 'object')

  return cloned
}

const SECTION_LABELS = {
  banner: 'Banner',
  support: 'Apoio',
  search: 'Busca',
  faq: 'FAQ',
  contacts: 'Contatos',
  appearance: 'Aparência',
}

export const getSchema = (props = {}) => {
  const properties = commonProperties()

  if (props && props.categorySource === 'custom') {
    properties.categories = listField(
      '04.2 · Categorias e perguntas personalizadas',
      'Categoria',
      categoryFields,
      'Fonte única deste modo. Crie categorias e arraste para definir a ordem. Copie e confira o conteúdo das nove listas antes de ativar este modo.'
    )
  } else {
    properties.legacyCategorySettings = listField(
      '04.2 · Categorias atuais — Ordem e apresentação',
      'Categoria atual',
      {
        __editorItemTitle: editorTitle,
        id: {
          title: 'Categoria de origem',
          type: 'string',
          enum: LEGACY_CATEGORIES.map((item) => item.id),
          enumNames: LEGACY_CATEGORIES.map((item) => item.title),
        },
        title: stringField('Nome exibido na página'),
        visual: visualField('Ícone da categoria'),
        visible: visibleField('Exibir categoria'),
        videoUrl: categoryFields.videoUrl,
        videoTitle: categoryFields.videoTitle,
      },
      'Arraste para reordenar. Os itens referenciam as listas abaixo, sem copiar as perguntas. Para ocultar uma categoria, desative Exibir categoria.',
      LEGACY_CATEGORIES.map((item) => ({
        ...item,
        __editorItemTitle: item.title,
        visible: true,
        visual: {},
        videoUrl: '',
        videoTitle: '',
      }))
    )
    LEGACY_CATEGORIES.forEach((category, index) => {
      properties[category.id] = questionList(
        `04.${index + 3} · Perguntas — ${category.title}`
      )
    })
  }

  Object.assign(properties, contactAndAppearanceProperties())

  return {
    title: 'Magic Feet | Atendimento',
    description:
      'Conteúdo e apresentação da Central de Relacionamento. Os grupos seguem a ordem da página. As listas e propriedades atuais são preservadas enquanto a origem continuar em Conteúdo atual.',
    type: 'object',
    properties: Object.keys(properties).reduce((labeled, key) => {
      labeled[key] = withSectionLabels(
        properties[key],
        SECTION_LABELS[key] || 'FAQ'
      )

      return labeled
    }, {}),
  }
}

export default getSchema()
