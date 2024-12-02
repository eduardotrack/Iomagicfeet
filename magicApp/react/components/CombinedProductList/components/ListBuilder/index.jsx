import React from 'react'

import {
  ProductSummaryList,
  ProductSummaryListWithoutQuery,
} from 'vtex.product-summary'
import { useListContext, ListContextProvider } from 'vtex.list-context'

import { TextCard } from '../TextCard'
import { GridListBuilder } from './GridListBuilder'
import { LIST_GRID_DIVIDER } from '../../constants'
import { useQuery } from 'react-apollo'
import ProductsQuery from '../../queries/searchProduct.gql'

export function getListCustomElement(data, listType) {
  const elementsByType = {
    grid: LIST_GRID_DIVIDER,
    image: data.image && <img src={data.image} />,
    text: data.textCard && <TextCard data={data.textCard} />,
  }

  const listCustomElement = elementsByType[listType]

  return listCustomElement ? [listCustomElement] : []
}

export function ListBuilder({ children, ProductSummary, data, listType }) {
  const { list } = useListContext() || []

  const newListContextValue = list.concat(getListCustomElement(data, listType))

  const isGridList = listType === 'grid'

  const useCustomProductsQuery = data?.query?.ids?.length > 0

  const ListContent = isGridList ? (
    <GridListBuilder image={data.image}>{children}</GridListBuilder>
  ) : (
    children
  )

  return (
    <ListContextProvider list={newListContextValue}>
      {useCustomProductsQuery ? (
        <SearchProducts ProductSummary={ProductSummary} {...(data ?? {})}>
          {ListContent}
        </SearchProducts>
      ) : (
        <ProductSummaryList
          ProductSummary={ProductSummary}
          {...(data.query ?? {})}
        >
          {ListContent}
        </ProductSummaryList>
      )}
    </ListContextProvider>
  )
}

function SearchProducts({ children, ProductSummary, query }) {
  const selectedIds = query?.ids?.split(',') ?? []

  const { data, loading, error } = useQuery(ProductsQuery, {
    variables: {
      ids: selectedIds,
      // collection: query?.collection,
    },
  })

  const { productsByIdentifier: products } = data ?? {}
  // Not using ?? operator because listName can be ''
  // eslint-disable-next-line no-unneeded-ternary
  const listName = 'List of products'

  if (loading || error) {
    return null
  }

  return (
    <ProductSummaryListWithoutQuery
      products={products}
      listName={listName}
      ProductSummary={ProductSummary}
    >
      {/* <ProductListStructuredData products={products} /> */}
      {children}
    </ProductSummaryListWithoutQuery>
  )
}
