import React, { useEffect, useState } from 'react'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'
import { waitForElement } from '../../utils/waitForElement'
import ReactDOM from 'react-dom'
import styles from './styles.css'

function AppliedFiltersElement({ breadcrumbs, onRemove }) {
  const [isOpen, setIsOpen] = useState(true)

  if (!breadcrumbs?.length) return null

  return (
    <div className={styles.appliedFiltersContainer}>
      <button
        className={styles.appliedFiltersTitle}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Filtros atuais</span>
        <svg className={`${styles.arrow} ${isOpen && styles.open}`} width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2258 0.491217C12.776 0.0276302 12.0321 0.0272246 11.5817 0.490321L8.09388 4.07686C7.60901 4.57545 6.80822 4.57545 6.32336 4.07686L2.83553 0.49032C2.38518 0.0272236 1.64128 0.0276295 1.19144 0.491217C0.760005 0.935828 0.760005 1.64281 1.19144 2.08742L6.32242 7.37515C6.80748 7.87503 7.60976 7.87503 8.09482 7.37515L13.2258 2.08742C13.6572 1.64281 13.6572 0.935829 13.2258 0.491217Z" fill="#1C1C1C"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.appliedFiltersWrapper}>
          {breadcrumbs.map((filter, i) => (
            <button
              key={filter.name}
              onClick={() => onRemove(i)}
              className={styles.appliedFiltersItem}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0.144531C3.8525 0.144531 0.5 3.49703 0.5 7.64453C0.5 11.792 3.8525 15.1445 8 15.1445C12.1475 15.1445 15.5 11.792 15.5 7.64453C15.5 3.49703 12.1475 0.144531 8 0.144531ZM11.75 10.337L10.6925 11.3945L8 8.70203L5.3075 11.3945L4.25 10.337L6.9425 7.64453L4.25 4.95203L5.3075 3.89453L8 6.58703L10.6925 3.89453L11.75 4.95203L9.0575 7.64453L11.75 10.337Z" fill="black"/>
              </svg>
              {filter.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AppliedFilters() {
  const { searchQuery } = useSearchPage()

  if (typeof window === 'undefined') return null
  if (!searchQuery?.data?.facets?.breadcrumb?.length) return null

  // console.log('panda searchQuery', searchQuery)

  // Protege contra pathname indefinido
  const path = window?.location?.pathname || ''
  const urlParts = path.split('/').filter(Boolean)
  const mainCategory = urlParts?.[urlParts.length - 1]?.toLowerCase() || ''

  // categorias criadas (vtex trata como filtro)
  const CUSTOM_CATEGORIES = ['novidades', 'outlet', 'ocasioes', 'marcas']

  // se for categoria customizada não a exclui do filtros aplicados (vtex a trata como filtro)
  const breadcrumbs = CUSTOM_CATEGORIES.includes(mainCategory) ?
    searchQuery?.data?.facets?.breadcrumb :
    searchQuery?.data?.facets?.breadcrumb
      ?.slice(1)
      ?.filter(item => item?.name?.toLowerCase() !== mainCategory) || []

  function handleRemove(indexToRemove) {
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const query = searchParams.get('query')?.split('/').filter(Boolean) || []
      const map = searchParams.get('map')?.split(',') || []
      const initialMap = searchParams.get('initialMap')
      const initialQuery = searchParams.get('initialQuery')

      const realIndex = indexToRemove + 1
      query.splice(realIndex, 1)
      map.splice(realIndex, 1)

      const newUrl = new URL(window.location.origin + window.location.pathname)
      if (initialMap) newUrl.searchParams.set('initialMap', initialMap)
      if (initialQuery) newUrl.searchParams.set('initialQuery', initialQuery)
      newUrl.searchParams.set('map', map.join(','))
      newUrl.searchParams.set('query', '/' + query.join('/'))

      // Mantém outros parâmetros
      for (const [key, value] of searchParams.entries()) {
        if (!['map', 'query', 'initialMap', 'initialQuery'].includes(key)) {
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
    if (filtersContainer?.[0]) {
      const existingDiv = filtersContainer[0].querySelector('.applied-filters-container')
      if (existingDiv) existingDiv.remove()

      const container = document.createElement('div')
      container.className = 'applied-filters-container'
      filtersContainer[0].prepend(container)

      ReactDOM.render(
        <AppliedFiltersElement breadcrumbs={breadcrumbs} onRemove={handleRemove} />,
        container
      )
    }
  }

  async function handleClearFilters() {
    document.addEventListener('click', ev => {
      const button = ev.target.closest(
        '.vtex-search-result-3-x-filterClearButtonWrapper--filter-navigator'
      )
      if (!button) return

      ev.preventDefault()
      ev.stopPropagation()
      window.location.href = window.location.pathname
    })
  }

  useEffect(() => {
    insertAppliedFilters()
    // handleClearFilters()
  }, [searchQuery])

  return null
}