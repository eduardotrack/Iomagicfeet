import React from 'react'

import CombinedProductListWithSlide from './components/CombinedProductList/CombinedProductListWithSlide'
import { QuerySchema, TextCardSchema } from './components/CombinedProductList'

export default function CombinedProductListWithSlideText(props) {
  return <CombinedProductListWithSlide {...props} />
}

CombinedProductListWithSlideText.schema = {
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
