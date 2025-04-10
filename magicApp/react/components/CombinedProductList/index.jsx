import React, { useEffect, useMemo, useState } from 'react'
import { useListContext } from 'vtex.list-context'

import { ListBuilder } from './components/ListBuilder'

import styles from './styles.css'

export function CombinedProductList({
  children,
  ProductSummary,
  items,
  productCounterIcon,
  showProductsCounter,
  getCounter,
  listType = 'text',
}) {
  const [productsCounter, setProductsCounter] = useState(undefined)

  useEffect(() => {
    getCounter?.(productsCounter)

    // fix slider bug
    const rightArrow = document.querySelector('.vtex-slider-layout-0-x-sliderRightArrow--home-week-featured')
    const leftArrow = document.querySelector('.vtex-slider-layout-0-x-sliderLeftArrow--home-week-featured')

    if (rightArrow && leftArrow) {
      const slidersContainer = window.document.querySelector(
        '[class*="flexRow--home-week-featured"]'
      )

      if (slidersContainer) {
        if (slidersContainer.classList.contains('slider-fixed')) return

        leftArrow.click();
        setTimeout(() => {
          rightArrow.click();
        }, 500)
        setTimeout(() => {
          slidersContainer.style.opacity = '1'
          slidersContainer.classList.add('slider-fixed')
        }, 600)
      }
    }
  }, [getCounter, productsCounter])

  if (!items) {
    return null
  }

  const ItemsList = useMemo(
    () =>
      items.reduceRight(
        (Previous, itemData) => (
          <ListBuilder
            ProductSummary={ProductSummary}
            data={itemData}
            listType={listType}
          >
            <>
              {showProductsCounter && (
                <GetProductCounter
                  update={(value) => setProductsCounter(value)}
                />
              )}
              {Previous}
            </>
          </ListBuilder>
        ),
        showProductsCounter ? (
          <>
            <GetProductCounter
              updateCounter={(value) => setProductsCounter(value)}
            />
            {children}
          </>
        ) : (
          children
        )
      ),
    [items, children]
  )

  return (
    <>
      {showProductsCounter && !getCounter && (
        <div className={styles.combinedProductList__productsCounter}>
          <img src={productCounterIcon} alt="Mini Cart Icon" />
          <span>{productsCounter}</span>
        </div>
      )}
      <div className={styles.combinedProductList__container}>{ItemsList}</div>
    </>
  )
}

const GetProductCounter = ({ updateCounter }) => {
  const { list } = useListContext() || []

  useEffect(() => {
    updateCounter?.(list.length)
  }, [])

  return null
}

export const TextCardSchema = {
  logo: {
    type: 'string',
    title: 'Logo',
    widget: {
      'ui:widget': 'image-uploader',
    },
  },
  title: {
    type: 'string',
    title: 'Título',
    widget: {
      'ui:widget': 'textarea',
    },
  },
  textBg: {
    type: 'string',
    title: 'Cor do card',
    widget: {
      'ui:widget': 'color',
    },
    default: '#F9EBFF',
  },
}

export const QuerySchema = {
  ids: {
    title: 'Ids dos produtos',
    description: 'Ids dos produtos separados por virgula',
    type: 'string',
    isLayout: false,
  },
  collection: {
    title: 'Coleção',
    type: 'string',
    isLayout: false,
  },

  maxItems: {
    title: 'Numero máximo de itens',
    type: 'number',
    isLayout: false,
    default: 4,
  },
}

CombinedProductList.schema = {
  title: 'Listagem de produtos',
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          textCard: {
            type: 'object',
            properties: {
              ...TextCardSchema,
            },
          },
          query: {
            type: 'object',
            properties: {
              ...QuerySchema,
            },
          },
        },
      },
    },
  },
}
