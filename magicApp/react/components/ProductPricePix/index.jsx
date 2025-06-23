import { useProduct } from "vtex.product-context"
import styles from "./styles.css"

export function ProductPricePix({ isSummary = false, discountPercentage = 5 }) {
  const { product } = useProduct()

  const commercialOffer = product?.items?.[0]?.sellers?.[0]?.commertialOffer
  const sellingPrice = commercialOffer?.Price || 0
  const listPrice = commercialOffer?.ListPrice || 0

  if (!sellingPrice) {
    return null
  }

  const isOffer = listPrice > sellingPrice

  const pricePix = sellingPrice * (1 - discountPercentage / 100)
  const pricePixFormatted = pricePix.toFixed(2).replace(".", ",")

  let finalDiscountPercentage
  let oldPriceFormatted

  if (isOffer) {
    const preciseOfferDiscount = ((listPrice - sellingPrice) / listPrice) * 100
    const roundedOfferDiscount = Math.round(preciseOfferDiscount)

    finalDiscountPercentage = roundedOfferDiscount + discountPercentage
    oldPriceFormatted = listPrice.toFixed(2).replace(".", ",")
  } else {
    finalDiscountPercentage = discountPercentage
    oldPriceFormatted = sellingPrice.toFixed(2).replace(".", ",")
  }

  if (isSummary) {
    return (
      <div className={styles.summaryPixContainer}>
        <p className={styles.summaryPixPrice}>R$ {pricePixFormatted} no pix à vista</p>
      </div>
    )
  }

  return (
    <div className={styles.pixPriceContainer}>
      <p className={styles.pixPriceValue}>R$ {pricePixFormatted} no <span>pix à vista</span></p>
      <p className={styles.pixPriceOldValue}>R$ {oldPriceFormatted}</p>
      <span className={styles.pixPriceDiscount}>{finalDiscountPercentage}% OFF</span>
    </div>
  )
}

ProductPricePix.schema = {
  title: "Panda | Preço com Pix",
  description: "Configurações do componente de preço com desconto para pagamento via Pix.",
  type: "object",
  properties: {
    isSummary: {
      title: 'Resumo do produto (vitrine)',
      type: 'boolean',
      default: false,
    },
    discountPercentage: {
      title: 'Desconto percentual para pagamento via Pix',
      type: 'number',
      default: 5,
      minimum: 0,
      maximum: 100,
    }
  }
}