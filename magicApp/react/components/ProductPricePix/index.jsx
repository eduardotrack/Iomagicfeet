import { useProduct } from "vtex.product-context"
import styles from "./styles.css"

const PIX_DISCOUNT_PERCENTAGE = 5

export function ProductPricePix() {
  const { product } = useProduct()

  const commercialOffer = product?.items?.[0]?.sellers?.[0]?.commertialOffer
  const sellingPrice = commercialOffer?.Price || 0
  const listPrice = commercialOffer?.ListPrice || 0

  if (!sellingPrice) {
    return null
  }

  const isOffer = listPrice > sellingPrice

  const pricePix = sellingPrice * (1 - PIX_DISCOUNT_PERCENTAGE / 100)
  const pricePixFormatted = pricePix.toFixed(2).replace(".", ",")

  let finalDiscountPercentage
  let oldPriceFormatted

  if (isOffer) {
    const preciseOfferDiscount = ((listPrice - sellingPrice) / listPrice) * 100
    const roundedOfferDiscount = Math.round(preciseOfferDiscount)

    finalDiscountPercentage = roundedOfferDiscount + PIX_DISCOUNT_PERCENTAGE
    oldPriceFormatted = listPrice.toFixed(2).replace(".", ",")
  } else {
    finalDiscountPercentage = PIX_DISCOUNT_PERCENTAGE
    oldPriceFormatted = sellingPrice.toFixed(2).replace(".", ",")
  }

  return (
    <div className={styles.pixPriceContainer}>
      <p className={styles.pixPriceValue}>R$ {pricePixFormatted} no <span>pix à vista</span></p>
      <p className={styles.pixPriceOldValue}>R$ {oldPriceFormatted}</p>
      <span className={styles.pixPriceDiscount}>{finalDiscountPercentage}% Off</span>
    </div>
  )
}