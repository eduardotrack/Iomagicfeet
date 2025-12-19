import React, { useEffect, useState } from 'react'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'
import { waitForElement } from '../../utils/waitForElement'
import ReactDOM from 'react-dom'
import styles from './styles.css'

const normalize = (str = '') =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const normalizeFilterValue = (str = '') =>
  normalize(str).replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()

const CUSTOM_CATEGORIES = [
  'presentes',
  'novidades',
  'roupas',
  'tênis',
  'chinelos e sandálias',
  'acessórios',
  'marcas',
  'outlet',
  'black-friday',
  'promoções',
  'lançamentos',
  'todos produtos',
  'todos-produtos',
]

const NORMALIZED_CUSTOM_CATEGORIES = CUSTOM_CATEGORIES.map(normalize)

/* element */
function AppliedFiltersElement({ filters, onRemove }) {
  const [isOpen, setIsOpen] = useState(true)

  if (!filters?.length) return null

  const handleClick = (event, filter) => {
    event.preventDefault()
    onRemove(filter)
  }

  return (
    <div className={styles.appliedFiltersContainer}>
      <button
        className={styles.appliedFiltersTitle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Filtros atuais</span>
        <svg className={`${styles.arrow} ${isOpen && styles.open}`} width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2258 0.491217C12.776 0.0276302 12.0321 0.0272246 11.5817 0.490321L8.09388 4.07686C7.60901 4.57545 6.80822 4.57545 6.32336 4.07686L2.83553 0.49032C2.38518 0.0272236 1.64128 0.0276295 1.19144 0.491217C0.760005 0.935828 0.760005 1.64281 1.19144 2.08742L6.32242 7.37515C6.80748 7.87503 7.60976 7.87503 8.09482 7.37515L13.2258 2.08742C13.6572 1.64281 13.6572 0.935829 13.2258 0.491217Z" fill="#1C1C1C"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.appliedFiltersWrapper}>
          {filters.map((filter) => (
            <button
              key={`${filter.map}-${filter.value}`}
              onClick={(e) => handleClick(e, filter)}
              className={styles.appliedFiltersItem}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0.144531C3.8525 0.144531 0.5 3.49703 0.5 7.64453C0.5 11.792 3.8525 15.1445 8 15.1445C12.1475 15.1445 15.5 11.792 15.5 7.64453C15.5 3.49703 12.1475 0.144531 8 0.144531ZM11.75 10.337L10.6925 11.3945L8 8.70203L5.3075 11.3945L4.25 10.337L6.9425 7.64453L4.25 4.95203L5.3075 3.89453L8 6.58703L10.6925 3.89453L11.75 4.95203L9.0575 7.64453L11.75 10.337Z" fill="black"/>
              </svg>

              {filter.value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* insere o elemento */
export function AppliedFilters() {
  const { searchQuery } = useSearchPage()

  if (typeof window === 'undefined') return null

  const mapArray = searchQuery?.variables?.map?.split(',') || []

  const queryArray =
    searchQuery?.variables?.query?.split('/').filter(Boolean) || []

  if (!mapArray.length || !queryArray.length) return null

  // cria array de filtros aplicados
  const appliedFilters = mapArray.map((map, index) => ({
    map,
    value: normalizeFilterValue(queryArray[index]),
    index,
  }))

  // filtra categorias customizadas (vtex traz categoria como filtro) e ft (full text)
  const visibleFilters = appliedFilters.filter(
    ({ map, value }) =>
      map !== 'ft' &&
      !NORMALIZED_CUSTOM_CATEGORIES.includes(normalize(value))
  )

  function handleRemove(filter) {
    const labels = document.querySelectorAll('.vtex-checkbox__label')

    const normalizedValue = normalizeFilterValue(filter.value)

    // tenta encontrar o filtro real na página
    const realFilterButton = Array.from(labels).find(
      (label) =>
        normalizeFilterValue(label.getAttribute('for')) === normalizedValue
    )

    console.log('Removendo filtro:', filter, '->', realFilterButton)

    if (realFilterButton) {
      realFilterButton.click()
      return
    }

    // se não encontrar o botão pra fazer o click, remove pela URL
    try {
      const searchParams = new URLSearchParams(window.location.search)

      const query = searchParams.get('query')?.split('/').filter(Boolean) || []

      const map = searchParams.get('map')?.split(',') || []

      query.splice(filter.index, 1)
      map.splice(filter.index, 1)

      const newUrl = new URL(window.location.origin + window.location.pathname)

      newUrl.searchParams.set('map', map.join(','))
      newUrl.searchParams.set('query', '/' + query.join('/'))

      for (const [key, value] of searchParams.entries()) {
        if (!['map', 'query'].includes(key)) {
          newUrl.searchParams.set(key, value)
        }
      }

      window.location.href = newUrl.toString()
    } catch (err) {
      console.error('Erro ao remover filtro:', err)
    }
  }

  async function insertAppliedFilters() {
    const filtersContainer = await waitForElement(
      '.vtex-search-result-3-x-accordionFilterContainer--filter-navigator'
    )

    const targetContainer = filtersContainer?.[0]

    if (!targetContainer) return

    removeAppliedFilters()

    const container = document.createElement('div')
    container.className = 'applied-filters-container'
    targetContainer.prepend(container)

    ReactDOM.render(
      <AppliedFiltersElement filters={visibleFilters} onRemove={handleRemove} />,
      container
    )
  }

  function removeAppliedFilters() {
    const existingDiv = document.querySelector('.applied-filters-container')
    if (existingDiv) existingDiv.remove()
  }

  useEffect(() => {
    insertAppliedFilters()
  }, [searchQuery])

  useEffect(() => {
    // quando clica em "limpar" a vtex não dispara mudança na searchQuery
    const clearButton = document.querySelector(
      '.vtex-search-result-3-x-filterClearButtonWrapper--filter-navigator button'
    )

    if (!clearButton) return

    // remove os filtros aplicados após limpar
    clearButton.addEventListener('click', () => {
      setTimeout(removeAppliedFilters, 500)
    })
  }, [])

  return null
}
