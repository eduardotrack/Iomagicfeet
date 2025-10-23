import React from 'react'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'

import styles from './styles.css'

/**
 * Component responsible to show search result products counter
 *
 * @component
 */
export function FetchMoreCounter() {
  const { searchQuery } = useSearchPage()

  if (!searchQuery) return null

  const { recordsFiltered: totalProducts, products } =
    searchQuery.data?.productSearch ?? {}

  const availableProducts = products?.length

  if (!availableProducts || !totalProducts) return null

  const availableProductsProgress = (availableProducts / totalProducts) * 100

  return (
    <div className={styles.fetchMoreCounter__container}>
      <p className={styles.fetchMoreCounter__text}>
        Você viu <b>{availableProducts}</b> de <b>{totalProducts}</b> produtos
      </p>

      <div className={styles.fetchMoreCounter__progress}>
        <div
          style={{ width: `${availableProductsProgress}%` }}
          className={styles.fetchMoreCounter__progress__bar}
        ></div>
      </div>
    </div>
  )
}
