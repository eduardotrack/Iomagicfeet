import { useProduct } from 'vtex.product-context'
import styles from './styles.css'
import { useEffect } from 'react'

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

export function ProductPricePix({ isSummary = false, product = null }) {
  var selectedItem
  if (product) {
    selectedItem = product.items[0]
  } else {
    const product = useProduct()
    selectedItem = product.selectedItem
  }

  const {
    Price: sellingPrice = 0,
    ListPrice: listPrice = 0,
    spotPrice,
    Installments,
  } = selectedItem?.sellers?.[0]?.commertialOffer || {}

  // console.log('panda installments', Installments)
  // console.log('panda spotPrice', spotPrice)

  const pricePix = isSummary ? spotPrice : (Installments?.find((installment) => installment.Name === 'Pagaleve Pix A Vista Transparente à vista')?.Value || Installments[0]?.TotalValuePlusInterestRate)

  if (!sellingPrice || !pricePix) {
    return null
  }

  const oldPrice = listPrice > sellingPrice ? listPrice : sellingPrice
  const oldPriceFormatted = formatCurrency(oldPrice)
  const pricePixFormatted = formatCurrency(pricePix)

  const finalDiscountPercentage =
    listPrice < sellingPrice
      ? Math.floor(((sellingPrice - pricePix) / sellingPrice) * 100)
      : Math.floor(((listPrice - pricePix) / listPrice) * 100)

  // Tratamento para quando o produto NÃO tem desconto no Pix
  if (pricePix === sellingPrice) {
    useEffect(() => {
      const totalValueAtInstallments = document.querySelector(
        '.vtex-product-price-1-x-installmentsTotalValue--pdp'
      )

      if (totalValueAtInstallments) {
        totalValueAtInstallments.style.display = 'none'
      }

      const percentageDiscountTag = document.querySelector('.vtex-product-price-1-x-savings--product__price-savings-pdp-pix')

      if (percentageDiscountTag) {
        percentageDiscountTag.style.display = 'none'
      }
    }, [])

    return (
      <div
        className={
          isSummary ? `${styles.summaryPixPriceContainer} ${styles.summaryPixPriceContainerSimple}` : styles.pixPriceContainer
        }
      >
        <p
          className={isSummary ? styles.summaryPixPrice : styles.pixPriceValue}
        >
          {pricePixFormatted}
        </p>
        {listPrice > sellingPrice && (
          <p
            className={
              isSummary
                ? styles.summaryPixPriceOldValue
                : styles.pixPriceOldValue
            }
          >
            {oldPriceFormatted}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className={
        isSummary ? styles.summaryPixPriceContainer : styles.pixPriceContainer
      }
    >
      <p className={isSummary ? styles.summaryPixPrice : styles.pixPriceValue}>
        {pricePixFormatted} <span>no pix à vista</span>
      </p>
      <p
        className={
          isSummary
            ? styles.summaryPixPriceOldValue
            : styles.pixPriceOldValue
        }
      >
        {oldPriceFormatted}
      </p>
      <span
        className={
          isSummary ? styles.summaryPixPriceDiscount : styles.pixPriceDiscount
        }
      >
        {finalDiscountPercentage}% Off
      </span>
    </div>
  )
}

ProductPricePix.schema = {
  title: 'Panda | Preço com Pix',
  description:
    'Configurações do componente de preço com desconto para pagamento via Pix.',
  type: 'object',
  properties: {
    isSummary: {
      title: 'Resumo do produto (vitrine)',
      type: 'boolean',
      default: false,
    },
  },
}
