import React, { useState, useEffect } from "react"
import styles from "./styles.css"

export const ProductCard = ({ product }) => {
  const sku = product.items?.[0]
  const image = sku?.images?.[0]

  const discountPercentage = Math.round(((product.priceRange?.listPrice?.lowPrice - product.priceRange?.sellingPrice?.lowPrice) / product.priceRange?.listPrice?.lowPrice) * 100) || 0

  return (
    <article className={`${styles.customProductCardSummary} vtex-product-summary-2-x-element vtex-product-summary-2-x-element--product__summary-category pointer pt3 pb4 flex flex-column h-100`}>
      <a href={`/${product.linkText}/p`} className={styles.productCardCustomLink}>
        {/* Image */}
        {discountPercentage > 0 && (
          <span class="vtex-product-price-1-x-savings vtex-product-price-1-x-savings--product-discount-tag-category">
            <span class="vtex-product-price-1-x-savingsPercentage vtex-product-price-1-x-savingsPercentage--product-discount-tag-category">
              -{discountPercentage}%
            </span>
          </span>
        )}
        <div className="vtex-product-summary-2-x-imageContainer vtex-product-summary-2-x-imageContainer--shelf__image-category-category">
          <img
            src={image?.imageUrl}
            alt={product.productName}
            className="vtex-product-summary-2-x-image vtex-product-summary-2-x-image--shelf__image-category-category"
          />
        </div>

        {/* Info */}
        <div className={`${styles.productCardCustomInfo} vtex-flex-layout-0-x-flexCol vtex-flex-layout-0-x-flexCol--product-info-category flex flex-column w-100`}>

          {/* Brand */}
          <div className="flex mt0 mb0 pt0 pb0    justify-between vtex-flex-layout-0-x-flexRowContent vtex-flex-layout-0-x-flexRowContent--brand-and-reviews items-stretch w-100">
            <span className="vtex-store-components-3-x-productBrandName vtex-store-components-3-x-productBrandName--product-brand-tag-category">
              {product.brand}
            </span>
            <Reviews productId={product.productId} />
          </div>

          {/* Name */}
          <h3 className="vtex-product-summary-2-x-productNameContainer vtex-product-summary-2-x-productNameContainer--product__summary-name-category mv0 vtex-product-summary-2-x-nameWrapper vtex-product-summary-2-x-nameWrapper--product__summary-name-category overflow-hidden c-on-base f5">
            <span className="vtex-product-summary-2-x-productBrand vtex-product-summary-2-x-productBrand--product__summary-name-category vtex-product-summary-2-x-brandName vtex-product-summary-2-x-brandName--product__summary-name-category t-body">
              {product.productName}
            </span>
          </h3>

          <div className={styles.productCardCustomInfoFooter}>
            <div className="magicfeet-magicapp-0-x-summaryPixPriceContainer">
              <p className="magicfeet-magicapp-0-x-summaryPixPrice">
                {product.priceRange?.sellingPrice?.lowPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              {product.priceRange?.listPrice?.lowPrice > product.priceRange?.sellingPrice?.lowPrice &&
                <p className="magicfeet-magicapp-0-x-summaryPixPriceOldValue">
                  {product.priceRange?.listPrice?.lowPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              }
            </div>

            {/* Buy Button */}
            <button className={`${styles.productCardCustomBuyButton} vtex-button bw1 ba fw5 v-mid relative pa0 lh-solid br2 min-h-regular t-action bg-action-primary b--action-primary c-on-action-primary hover-bg-action-primary hover-b--action-primary hover-c-on-action-primary pointer w-100 `} type="button">
              comprar
            </button>
          </div>
        </div>
      </a>
    </article>
  )
}


const STORE_KEY = "5efc94b1-a200-45ee-a74f-9afc5d2e7558"

const Reviews = ({ productId }) => {
  const [rating, setRating] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!productId) return

    let isMounted = true

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `https://service.yourviews.com.br/api/v2/pub/review/${productId}`,
          {
            headers: {
              YVStoreKey: STORE_KEY,
              "Content-Type": "application/json",
            },
          }
        )
        const data = await response.json()
        if (!isMounted) return
        
        if (data?.Element) {
          setRating(data.Element.Rating)
          setTotal(data.Element.TotalRatings || 0)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Erro ao buscar reviews", err)
        }
      }
    }

    fetchReviews()

    return () => {
      isMounted = false
    }
  }, [productId])

  const percentage = rating > 0 ? (rating / 5) * 100 : 0

  return (
    <div
      className="pr0 items-stretch vtex-flex-layout-0-x-stretchChildrenWidth flex"
      style={{ width: 'auto' }}
    >
      <div
        className="vtex-flex-layout-0-x-flexRow vtex-flex-layout-0-x-flexRow--product-rating-category"
        aria-label="Linha de sessão"
      >
        <div className="flex mt0 mb0 pt0 pb0 justify-between vtex-flex-layout-0-x-flexRowContent vtex-flex-layout-0-x-flexRowContent--product-rating-category items-stretch w-100">

          <div
            className="pr0 items-stretch vtex-flex-layout-0-x-stretchChildrenWidth flex"
            style={{ width: 'auto' }}
          >
            <div className="vtex-reviews-and-ratings-3-x-inlineContainer review-summary mw8 center" />
          </div>

          <div
            className="pr0 items-stretch vtex-flex-layout-0-x-stretchChildrenWidth flex"
            style={{ width: 'auto' }}
          >
            <div className="yourviews-yourviewsreviews-0-x-inlineRating inlineRating mw8 center ph5">

              <div className="yourviews-yourviewsreviews-0-x-ratingStars dib relative v-mid mr2">
                <div className="nowrap">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={`inactive-${i}`}
                      className="yourviews-yourviewsreviews-0-x-ratingStarsInactive"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14.737 14"
                    >
                      <path d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z" />
                    </svg>
                  ))}
                </div>
                <div
                  className="nowrap overflow-hidden absolute top-0-s left-0-s yvstar"
                  style={{ width: `${percentage}%` }}
                >
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={`active-${i}`}
                      className="yourviews-yourviewsreviews-0-x-ratingStarsActive"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14.737 14"
                    >
                      <path d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z" />
                    </svg>
                  ))}
                </div>
              </div>

              <span className="yourviews-yourviewsreviews-0-x-ratingStarsTotal">
                {total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
