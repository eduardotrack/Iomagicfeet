import React from 'react'

import { CombinedProductList, QuerySchema } from '.'

export function CombinedProductListWithGrid({ ...props }) {
  return <CombinedProductList {...props} listType="grid" />
}

CombinedProductListWithGrid.schema = {
  title: 'Listagem de produtos',
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            title: 'Imagem',
            widget: {
              'ui:widget': 'image-uploader',
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
