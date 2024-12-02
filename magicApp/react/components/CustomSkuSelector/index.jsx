import React, { useEffect, useRef, useState } from 'react'
import { ProductSummaryContext } from 'vtex.product-summary-context'
import { canUseDOM } from 'vtex.render-runtime'

import { getDefaultSeller } from '../../utils/sellers'

import { Select } from './Select'
import styles from './styles.css'

const { useProductSummary, useProductSummaryDispatch } = ProductSummaryContext

export function CustomSkuSelector({ SkuSelectorBase, buyOnSelection = false }) {
  const dispatch = useProductSummaryDispatch()
  const { product } = useProductSummary()
  const [isLoading, setIsLoading] = useState(false)

  const shouldAddToCart = useRef(false)
  const containerRef = useRef(null)

  const [options, setOptions] = useState([])

  if (!SkuSelectorBase) return null

  const handleSKUSelected = (skuId) => {
    if (skuId == null) {
      dispatch({
        type: 'SET_PRODUCT_QUERY',
        args: { query: '' },
      })

      return
    }

    const selectedItem =
      product.items && product.items.find((item) => item.itemId === skuId)

    const sku = {
      ...selectedItem,
      image: selectedItem.images[0],
      seller: getDefaultSeller(selectedItem.sellers),
    }

    const newProduct = {
      ...product,
      selectedItem,
      sku,
    }

    dispatch({
      type: 'SET_PRODUCT',
      args: { product: newProduct },
    })

    dispatch({
      type: 'SET_PRODUCT_QUERY',
      args: { query: `skuId=${skuId}` },
    })

    setIsLoading(true)
    shouldAddToCart.current = true
  }

  useEffect(() => {
    handleAvailableOptions()

    if (shouldAddToCart.current) {
      shouldAddToCart.current = false

      setTimeout(() => {
        setIsLoading(false)

        const productCard = containerRef.current?.closest(
          '.vtex-product-summary-2-x-container'
        )

        const addToCartButton = productCard.querySelector(
          '.vtex-product-summary-2-x-element .vtex-add-to-cart-button-0-x-buttonDataContainer'
        )

        addToCartButton?.click()
      }, 500)
    }
  }, [product])

  function handleAvailableOptions() {
    const availableItems = containerRef.current?.querySelectorAll(
      '.vtex-product-summary-2-x-skuSelectorItem:not(.vtex-product-summary-2-x-unavailable) .vtex-product-summary-2-x-valueWrapper'
    )

    const availableOptions = Array.from(availableItems).map((item) => ({
      value: item.innerHTML?.trim(),
      label: item.innerHTML?.trim(),
    }))

    setOptions(availableOptions)
  }

  function handleSelectedOption(selectedOption) {
    const availableItems = containerRef.current?.querySelectorAll(
      '.vtex-product-summary-2-x-skuSelectorItem:not(.vtex-product-summary-2-x-unavailable) .vtex-product-summary-2-x-valueWrapper'
    )

    const selectedItem = Array.from(availableItems).find(
      (item) => item.innerHTML?.trim() === selectedOption.value
    )

    selectedItem?.click()
  }

  return (
    <div
      className={styles.customSkuSelector__container}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      ref={containerRef}
    >
      {canUseDOM && (
        <Select
          name="product-size"
          isLoading={isLoading}
          disabled={isLoading}
          options={options}
          menuPortalTarget={document.body}
          onChange={handleSelectedOption}
        />
      )}

      {buyOnSelection ? (
        <SkuSelectorBase
          hideImpossibleCombinations
          initialSelection="empty"
          onSKUSelected={handleSKUSelected}
        />
      ) : (
        <SkuSelectorBase hideImpossibleCombinations initialSelection="empty" />
      )}
    </div>
  )
}
