import { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { waitForElement } from "../../utils/waitForElement"

import styles from "./styles.css"

function LayoutControlElement({ container }) {
  const [activeLayout, setActiveLayout] = useState('list')

  function handleLayoutChange(layout) {
    setActiveLayout(layout)
    container.classList.remove('list-layout', 'grid-layout')
    container.classList.add(layout === 'list' ? 'list-layout' : 'grid-layout')
  }

  useEffect(() => {
    handleLayoutChange('grid')
  }, [])

  return (
    <div className={styles.filtersLayoutControl}>
      <button
        className={`${styles.filtersLayoutControlButton} ${activeLayout === 'grid' ? styles.filtersLayoutControlButtonActive : ''}`}
        onClick={() => handleLayoutChange('grid')}
      >
        <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 2.21875C1 2.48397 1.10536 2.73832 1.29289 2.92586C1.48043 3.11339 1.73478 3.21875 2 3.21875C2.26522 3.21875 2.51957 3.11339 2.70711 2.92586C2.89464 2.73832 3 2.48397 3 2.21875C3 1.95353 2.89464 1.69918 2.70711 1.51164C2.51957 1.32411 2.26522 1.21875 2 1.21875C1.73478 1.21875 1.48043 1.32411 1.29289 1.51164C1.10536 1.69918 1 1.95353 1 2.21875Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 2.21875C8 2.48397 8.10536 2.73832 8.29289 2.92586C8.48043 3.11339 8.73478 3.21875 9 3.21875C9.26522 3.21875 9.51957 3.11339 9.70711 2.92586C9.89464 2.73832 10 2.48397 10 2.21875C10 1.95353 9.89464 1.69918 9.70711 1.51164C9.51957 1.32411 9.26522 1.21875 9 1.21875C8.73478 1.21875 8.48043 1.32411 8.29289 1.51164C8.10536 1.69918 8 1.95353 8 2.21875Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 2.21875C15 2.48397 15.1054 2.73832 15.2929 2.92586C15.4804 3.11339 15.7348 3.21875 16 3.21875C16.2652 3.21875 16.5196 3.11339 16.7071 2.92586C16.8946 2.73832 17 2.48397 17 2.21875C17 1.95353 16.8946 1.69918 16.7071 1.51164C16.5196 1.32411 16.2652 1.21875 16 1.21875C15.7348 1.21875 15.4804 1.32411 15.2929 1.51164C15.1054 1.69918 15 1.95353 15 2.21875Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1 9.21875C1 9.48397 1.10536 9.73832 1.29289 9.92586C1.48043 10.1134 1.73478 10.2188 2 10.2188C2.26522 10.2188 2.51957 10.1134 2.70711 9.92586C2.89464 9.73832 3 9.48397 3 9.21875C3 8.95353 2.89464 8.69918 2.70711 8.51164C2.51957 8.32411 2.26522 8.21875 2 8.21875C1.73478 8.21875 1.48043 8.32411 1.29289 8.51164C1.10536 8.69918 1 8.95353 1 9.21875Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 9.21875C8 9.48397 8.10536 9.73832 8.29289 9.92586C8.48043 10.1134 8.73478 10.2188 9 10.2188C9.26522 10.2188 9.51957 10.1134 9.70711 9.92586C9.89464 9.73832 10 9.48397 10 9.21875C10 8.95353 9.89464 8.69918 9.70711 8.51164C9.51957 8.32411 9.26522 8.21875 9 8.21875C8.73478 8.21875 8.48043 8.32411 8.29289 8.51164C8.10536 8.69918 8 8.95353 8 9.21875Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 9.21875C15 9.48397 15.1054 9.73832 15.2929 9.92586C15.4804 10.1134 15.7348 10.2188 16 10.2188C16.2652 10.2188 16.5196 10.1134 16.7071 9.92586C16.8946 9.73832 17 9.48397 17 9.21875C17 8.95353 16.8946 8.69918 16.7071 8.51164C16.5196 8.32411 16.2652 8.21875 16 8.21875C15.7348 8.21875 15.4804 8.32411 15.2929 8.51164C15.1054 8.69918 15 8.95353 15 9.21875Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1 16.2188C1 16.484 1.10536 16.7383 1.29289 16.9259C1.48043 17.1134 1.73478 17.2188 2 17.2188C2.26522 17.2188 2.51957 17.1134 2.70711 16.9259C2.89464 16.7383 3 16.484 3 16.2188C3 15.9535 2.89464 15.6992 2.70711 15.5116C2.51957 15.3241 2.26522 15.2188 2 15.2188C1.73478 15.2188 1.48043 15.3241 1.29289 15.5116C1.10536 15.6992 1 15.9535 1 16.2188Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 16.2188C8 16.484 8.10536 16.7383 8.29289 16.9259C8.48043 17.1134 8.73478 17.2188 9 17.2188C9.26522 17.2188 9.51957 17.1134 9.70711 16.9259C9.89464 16.7383 10 16.484 10 16.2188C10 15.9535 9.89464 15.6992 9.70711 15.5116C9.51957 15.3241 9.26522 15.2188 9 15.2188C8.73478 15.2188 8.48043 15.3241 8.29289 15.5116C8.10536 15.6992 8 15.9535 8 16.2188Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 16.2188C15 16.484 15.1054 16.7383 15.2929 16.9259C15.4804 17.1134 15.7348 17.2188 16 17.2188C16.2652 17.2188 16.5196 17.1134 16.7071 16.9259C16.8946 16.7383 17 16.484 17 16.2188C17 15.9535 16.8946 15.6992 16.7071 15.5116C16.5196 15.3241 16.2652 15.2188 16 15.2188C15.7348 15.2188 15.4804 15.3241 15.2929 15.5116C15.1054 15.6992 15 15.9535 15 16.2188Z" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        className={`${styles.filtersLayoutControlButton} ${activeLayout === 'list' ? styles.filtersLayoutControlButtonActive : ''}`}
        onClick={() => handleLayoutChange('list')}
      >
        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 1.21875H16M5 7.21875H16M5 13.2188H16M1 1.21875V1.22875M1 7.21875V7.22875M1 13.2188V13.2288" stroke="#49454F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

export function LayoutControlForFilters() {
  async function insertControlInFilters() {
    const filtersContainers = await waitForElement('.vtex-search-result-3-x-accordionFilterOpen')

    filtersContainers.forEach((filter) => {
      const searchBarContainer = filter.querySelector('.vtex-search-result-3-x-searchFilterBar--filter-navigator')
      if (searchBarContainer && !searchBarContainer.querySelector('.layout-control-for-filters')) {
        const container = document.createElement("div")
        container.className = "layout-control-for-filters"
        searchBarContainer.append(container)

        ReactDOM.render(<LayoutControlElement container={filter} />, container)
      }
    })
  }

  useEffect(() => {
    insertControlInFilters()
  }, [])

  return null
}
