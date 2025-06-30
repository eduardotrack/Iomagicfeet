import React, { useState, useEffect } from 'react'
import styles from './styles.css'
import { index as RichText } from 'vtex.rich-text'

/**
 * Componente para exibir um único item de FAQ.
 */
const FaqItem = ({ pergunta, resposta }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.CR_faqitem}>
      <div
        className={styles.CR_faqitem_pergunta}
        onClick={() => setIsOpen(!isOpen)}
      >
        <p>{pergunta}</p>
        <span>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect width="32" height="32" fill="white" />
              <path
                d="M24 20L16 12L8 20"
                stroke="#1E1E1E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect width="32" height="32" fill="white" />
              <path
                d="M8 12L16 20L24 12"
                stroke="#1E1E1E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </div>
      {isOpen && (
        <div className={styles.CR_faqitem_resposta}>
          <RichText
            text={resposta ?? undefined}
            htmlId="CR_faq_resposta"
            blockClass="boasPraticas-TrocaeDevolucoes"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Componente para exibir uma lista de FAQs por categoria quando uma categoria é selecionada.
 */
const FaqCategoriaSelecionada = ({ categoria, faqs, onVoltar }) => {
  // Formata o nome da categoria para exibição
  const categoriaFormatada =
    categoria === 'devolucaoetroca'
      ? 'Devolução e Troca'
      : categoria === 'retiradaemloja'
        ? 'Retirada em Loja'
        : categoria === 'lojasefranquias'
          ? 'Lojas e Franquias'
          : categoria === 'cadastroendereco'
            ? 'Cadastro e Endereço'
            : categoria.charAt(0).toLowerCase() + categoria.slice(1)

  return (
    <div className={styles.CR_faqselecionada}>
      <div className={styles.CR_faqselecionada_header}>
        <img
          className={styles.CR_blocofaq_icon}
          src={`/arquivos/${categoria}_CR.svg`}
          alt={`Icone ${categoriaFormatada}`}
        />
        <span className={styles.CR_faqselecionada_title}>
          {categoriaFormatada}
        </span>
      </div>

      <div className={styles.CR_faqselecionada_content}>
        {faqs.map((faq, index) => (
          <FaqItem
            key={index}
            pergunta={faq.pergunta}
            resposta={faq.resposta}
          />
        ))}
      </div>

      {categoria === 'devolucaoetroca' && (
        <div className={styles.CR_videoContainer}>
          <h3>Assista ao nosso vídeo com dicas de boas práticas para trocas e devoluções:</h3>
          <iframe
            width="560" // Adjust as needed
            height="500" // Adjust as needed
            src="https://www.youtube.com/embed/elPiqIQ0kYk" // Replace YOUR_VIDEO_ID with the actual YouTube video ID
            title="YouTube video player - Devolução e Troca"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  )
}

/**
 * Componente para exibir uma lista de FAQs por categoria.
 */
const FaqList = ({
  categoria,
  faqs,
  onCategoriaClick,
  categoriaClicada,
  descricao,
}) => {
  // Formata a categoria para exibição
  const categoriaFormatada =
    categoria === 'devolucaoetroca'
      ? 'Devolução e Troca'
      : categoria === 'retiradaemloja'
        ? 'Retirada em Loja'
        : categoria === 'lojasefranquias'
          ? 'Lojas e Franquias'
          : categoria === 'cadastroendereco'
            ? 'Cadastro e Endereço' //alterado aqui
            : categoria.charAt(0).toLowerCase() + categoria.slice(1)
  const numeroDeArtigos = faqs ? faqs.length : 0

  return (
    <div
      onClick={() => onCategoriaClick(categoria)}
      className={styles.CR_blocofaq}
    >
      <div className={styles.CR_blocofaq_iconContainer}>
        <img
          className={styles.CR_blocofaq_icon}
          src={`/arquivos/${categoria}_CR.svg`}
          alt={`Icone ${categoriaFormatada}`}
        />
      </div>

      <strong className={styles.CR_blocofaq_title}>{categoriaFormatada}</strong>

      <p className={styles.CR_blocofaq_text}>{descricao}</p>
      <p className={styles.CR_blocofaq_artigos}>
        {numeroDeArtigos} {numeroDeArtigos === 1 ? 'Artigo' : 'Artigos'}
      </p>
    </div>
  )
}

/**
 * Componente principal da Central de Relacionamento, exibindo FAQs com busca e categorias.
 */
const CentralRelacionamento = ({
  devolucaoetroca = [],
  cancelamento = [],
  rastreamento = [],
  retiradaemloja = [],
  entrega = [],
  lojasefranquias = [],
  produto = [],
  pagamento = [],
  cadastroendereco = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [faqsPorCategoria, setFaqsPorCategoria] = useState({})
  const [categorias, setCategorias] = useState([])
  const [categoriaClicada, setCategoriaClicada] = useState(null)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)

  // Descrições para cada categoria
  const categoriasDescricoes = {
    devolucaoetroca: 'Política de Devolução e Troca',
    cancelamento: 'Processo de cancelamento',
    cadastroendereco: 'Informações sobre cadastro e endereço',
    rastreamento: 'Rastreamento de pedidos',
    retiradaemloja: 'Retirada de pedidos na loja',
    entrega: 'Informações sobre entrega',
    lojasefranquias: 'Localização de lojas e franquias',
    produto: 'Saiba mais sobre características do produto',
    pagamento: 'Formas de pagamento disponíveis',
  }

  useEffect(() => {
    const faqs = {
      devolucaoetroca,
      cancelamento,
      cadastroendereco,
      rastreamento,
      retiradaemloja,
      entrega,
      lojasefranquias,
      produto,
      pagamento,
    }

    setFaqsPorCategoria(faqs)

    const categoriasDisponiveis = Object.keys(faqs).filter(
      (categoria) => faqs[categoria] && faqs[categoria].length > 0
    )
    setCategorias(categoriasDisponiveis)
  }, [
    devolucaoetroca,
    cancelamento,
    cadastroendereco,
    rastreamento,
    retiradaemloja,
    entrega,
    lojasefranquias,
    produto,
    pagamento,
  ])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleCategoriaClick = (categoria) => {
    setCategoriaSelecionada(categoria)
  }

  const handleVoltar = () => {
    setCategoriaSelecionada(null)
    setSearchTerm('') // Limpa a busca ao voltar
  }

  // Filtra os FAQs com base no termo de busca
  const filteredFaqs = Object.entries(faqsPorCategoria).reduce(
    (acc, [categoria, perguntasRespostas]) => {
      if (!perguntasRespostas) {
        return acc
      }
      const filtrados = perguntasRespostas.filter(
        (item) =>
          item &&
          item.pergunta &&
          item.pergunta.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filtrados.length > 0) {
        acc[categoria] = filtrados
      }
      return acc
    },
    {}
  )

  // Verifica se há resultados filtrados
  const temResultados = Object.values(filteredFaqs).flat().length > 0
  // Verifica se o botão "Voltar" deve ser exibido
  const exibirBotaoVoltar = searchTerm || categoriaSelecionada

  return (
    <div className={styles.CR_container}>
      <div className={styles.CR_header}>
        {exibirBotaoVoltar && (
          <button onClick={handleVoltar} className={styles.CR__voltar}>
            Voltar
          </button>
        )}

        <div className={styles.CR_header_title}>
          <p className={styles.CR_header_title_desktop}>
            {(searchTerm && temResultados) || categoriaSelecionada
              ? 'fale conosco'
              : 'temas de ajuda'}
          </p>
          <p className={styles.CR_header_title_mobile}>
            {(searchTerm && temResultados) || categoriaSelecionada
              ? 'fale conosco'
              : 'temas de ajuda'}
          </p>
        </div>

        <div className={styles.CR_header_input}>
          <label htmlFor="searchInput" className={styles.CR_search_label}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
            >
              <path
                d="M25 25L19.2682 19.1362M22.0786 11.463C22.0786 17.2416 17.36 21.9261 11.5393 21.9261C5.71861 21.9261 1 17.2416 1 11.463C1 5.68447 5.71861 1 11.5393 1C17.36 1 22.0786 5.68447 22.0786 11.463Z"
                stroke="#1C1C1C"
                strokeWidth="2"
              />
            </svg>
          </label>
          <input
            id="searchInput"
            type="text"
            placeholder="Em que podemos ajudar?"
            value={searchTerm}
            onChange={handleSearch}
            className={styles.CR_input}
          />
        </div>
      </div>

      <div className="app-content">
        {searchTerm && temResultados ? (
          // Exibe os resultados da busca
          <div className="search-results">
            <p className={styles.CR_search_title}>Resultados da Busca:</p>
            {Object.entries(filteredFaqs).map(
              ([categoria, perguntasRespostas]) =>
                perguntasRespostas &&
                perguntasRespostas.length > 0 && (
                  <div key={categoria}>
                    <div className={styles.CR_faqselecionada_search}>
                      <img
                        className={styles.CR_blocofaq_icon}
                        src={`/arquivos/${categoria}_CR.svg`}
                        alt={`Icone ${categoria}`}
                      />
                      <p className={styles.CR_search_categoria}>
                        {categoria === 'devolucaoetroca'
                          ? 'Devolução e Troca'
                          : categoria === 'retiradaemloja'
                            ? 'Retirada em Loja'
                            : categoria === 'lojasefranquias'
                              ? 'Lojas e Franquias'
                              : categoria === 'cadastroendereco'
                                ? 'Cadastro e Endereço' //alterado aqui
                                : categoria.charAt(0).toUpperCase() +
                                  categoria.slice(1)}
                      </p>
                    </div>

                    {perguntasRespostas.map((item, index) => (
                      <FaqItem
                        key={index}
                        pergunta={item.pergunta}
                        resposta={item.resposta}
                      />
                    ))}
                  </div>
                )
            )}
          </div>
        ) : searchTerm && !temResultados ? (
          <div className="search-results">
            <p style={{ color: '#7f8c8d' }}>
              Nenhum FAQ encontrado para: "{searchTerm}"
            </p>
          </div>
        ) : categoriaSelecionada ? (
          // Exibe a categoria selecionada em um bloco separado
          <FaqCategoriaSelecionada
            categoria={categoriaSelecionada}
            faqs={faqsPorCategoria[categoriaSelecionada] || []}
          />
        ) : (
          // Exibe os blocos fixos e a lista de FAQs por categoria padrão
          <div>
            <div className={styles.CR_blocofaq_fixo}>
              <a
                className={styles.CR_blocofaq}
                href="/institucional/nossas-lojas"
              >
                <img
                  className={styles.CR_blocofaq_icon}
                  src="/arquivos/Icon_nossaslojas_CR.svg"
                  alt="Icone nossas lojas"
                />
                <strong className={styles.CR_blocofaq_title}>
                  Nossas Lojas
                </strong>
                <p className={styles.CR_blocofaq_text}>
                  Encontre a magicfeet mais perto de você.
                </p>
              </a>

              <a href="/account#/orders" className={styles.CR_blocofaq}>
                <img
                  className={styles.CR_blocofaq_icon}
                  src="/arquivos/Icon_acompanhe_CR.svg"
                  alt="Icone acompanhe seu pedido"
                />
                <strong className={styles.CR_blocofaq_title}>
                  Acompanhe seu pedido
                </strong>
                <p className={styles.CR_blocofaq_text}>
                  Veja o status do seu pedido e acompanhe cada etapa da entrega.
                </p>
              </a>

              <a
                href="https://authenticfeet.neoassist.com/?th=tag_vmagicfeetfixa&openEmail=1"
                target="_blank"
                className={styles.CR_blocofaq}
              >
                <img
                  className={styles.CR_blocofaq_icon}
                  src="/arquivos/Icon_trocas_CR.svg"
                  alt="Icone trocas e devoluções"
                />
                <strong className={styles.CR_blocofaq_title}>
                  Trocas e Devoluções
                </strong>
                <p className={styles.CR_blocofaq_text}>
                  Entenda nossas políticas de troca e devolução de forma
                  simples.
                </p>
              </a>

              <a href="/tipos-de-entrega" className={styles.CR_blocofaq}>
                <img
                  className={styles.CR_blocofaq_icon}
                  src="/arquivos/Icon_entrega_CR.svg"
                  alt="Icone tipos de entrega"
                />
                <strong className={styles.CR_blocofaq_title}>
                  Tipos de Entrega
                </strong>
                <p className={styles.CR_blocofaq_text}>
                  Saiba mais sobre como escolher o seu frete.
                </p>
              </a>
            </div>

            {/* Exibe o texto de fale conosco */}
            <div className={styles.text_container_fale_conosco}>
              <p className={styles.CR_header_title_desktop}>fale conosco</p>
            </div>

            {/* Exibe os FAQs por categoria */}
            <div className={styles.CR_blocofaq_listContainer}>
              {categorias.map((categoria) => {
                const descricao = categoriasDescricoes[categoria] || ''
                const faqsDaCategoria = faqsPorCategoria[categoria] || []
                return (
                  faqsPorCategoria[categoria] &&
                  faqsPorCategoria[categoria].length > 0 && (
                    <FaqList
                      key={categoria}
                      categoria={categoria}
                      faqs={faqsDaCategoria}
                      onCategoriaClick={handleCategoriaClick}
                      categoriaClicada={categoriaClicada}
                      descricao={descricao}
                    />
                  )
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

CentralRelacionamento.schema = {
  title: 'Panda | Central de Relacionamento',
  description: 'Adicione perguntas frequentes agrupadas por categoria.',
  type: 'object',
  properties: {
    devolucaoetroca: {
      title: 'Devolução e Troca',
      description: 'Política de Devolução e Troca.',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    cancelamento: {
      title: 'Cancelamento',
      description: 'Processo de cancelamento ',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    cadastroendereco: {
      title: 'Cadastro e Endereço',
      description: 'Cadastro e Endereço',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    rastreamento: {
      title: 'Rastreamento',
      description: 'Rastreamento de pedidos',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    retiradaemloja: {
      title: 'Retirada em Loja',
      description: 'Retirada de pedidos na loja',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    entrega: {
      title: 'Entrega',
      description: 'Informações sobre Entrega',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    lojasefranquias: {
      title: 'Lojas e Franquias',
      description: 'Localização de lojas e franquias',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    produto: {
      title: 'Produto',
      description: 'Saiba mais sobre características do produto',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
    pagamento: {
      title: 'Pagamento',
      description: 'Formas de pagamento disponíveis',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: { title: 'Pergunta', type: 'string' },
          resposta: {
            title: 'Resposta',
            type: 'string',
            widget: { 'ui:widget': 'textarea' },
          },
        },
      },
    },
  },
}

export default CentralRelacionamento
