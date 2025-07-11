import { useProduct } from "vtex.product-context"
import styles from "./styles.css"

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })


export function ProductPricePix({ isSummary = false }) {
  const { selectedItem } = useProduct()

  const {
    Price: sellingPrice = 0,
    ListPrice: listPrice = 0,
    spotPrice,
    Installments,
  } = selectedItem?.sellers?.[0]?.commertialOffer || {}

  const pricePix = isSummary
    ? spotPrice
    : Installments?.find(
        (installment) =>
          installment.Name === 'Pagaleve Pix A Vista Transparente à vista'
      )?.Value

  if (!sellingPrice || !pricePix) {
    return null
  }

  const oldPrice = listPrice > sellingPrice ? listPrice : sellingPrice
  const oldPriceFormatted = formatCurrency(oldPrice)
  const pricePixFormatted = formatCurrency(pricePix)

  const finalDiscountPercentage = listPrice < sellingPrice
    ? Math.floor(((sellingPrice - pricePix) / sellingPrice) * 100)
    : Math.floor(((listPrice - pricePix) / listPrice) * 100)

  if (isSummary) {
    return (
      <div className={styles.summaryPixContainer}>
        <p className={styles.summaryPixPrice}>{pricePixFormatted} no pix à vista</p>
      </div>
    )
  }

  return (
    <div className={styles.pixPriceContainer}>
      <p className={styles.pixPriceValue}>{pricePixFormatted} no <span>pix à vista</span></p>
      <p className={styles.pixPriceOldValue}>{oldPriceFormatted}</p>
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
  }
}