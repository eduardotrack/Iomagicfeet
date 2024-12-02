import React from 'react'
import { ListContextProvider, useListContext } from 'vtex.list-context'

import styles from '../../styles.css'
import { LIST_GRID_DIVIDER } from '../../constants'

export function GridListBuilder({ children, image }) {
  const { list } = useListContext() || []
  const divider = list.findIndex((el) => el === LIST_GRID_DIVIDER)
  const maxAvailableItems = 5

  const elementsBeforeDivider = list.slice(0, divider)
  const elementsAfterDivider = list
    .slice(divider, divider + maxAvailableItems)
    .filter((el) => el !== LIST_GRID_DIVIDER)

  const newListElement = (
    <div
      className={styles.combinedProductList__grid}
      data-grid-items={elementsAfterDivider.length}
      data-grid-two-columns={elementsAfterDivider.length <= 2 || undefined}
    >
      <img
        className={styles.combinedProductList__grid__image}
        src={image}
        alt="Product Banner"
      />
      {elementsAfterDivider}
    </div>
  )

  const newListContextValue = [...elementsBeforeDivider, newListElement]

  return (
    <ListContextProvider list={newListContextValue}>
      {children}
    </ListContextProvider>
  )
}
