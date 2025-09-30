import { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './styles.css'

// Componentes para diferentes recomendações de tamanho
// Tênis
const ShoeSmall = () => (
  <div className={styles.sizeRecommendation__container}>
    <div className={styles.sizeRecommendation__texts}>
      <p className={styles.sizeRecommendation__title}>Produto com tamanho mais justo</p>
      <p className={styles.sizeRecommendation__subtitle}>Recomendamos escolher um número acima</p>
    </div>
  </div>
)
const ShoeOriginal = () => (
  <div className={styles.sizeRecommendation__container}>
    <div className={styles.sizeRecommendation__texts}>
      <p className={styles.sizeRecommendation__title}>Produto fiel ao tamanho</p>
      <p className={styles.sizeRecommendation__subtitle}>Recomendamos usar sua numeração padrão</p>
    </div>
  </div>
)
const ShoeBig = () => (
  <div className={styles.sizeRecommendation__container}>
    <div className={styles.sizeRecommendation__texts}>
      <p className={styles.sizeRecommendation__title}>Produto com tamanho mais largo</p>
      <p className={styles.sizeRecommendation__subtitle}>Recomendamos escolher um número abaixo</p>
    </div>
  </div>
)

// Roupas
const ClothesSmall = () => (
  <div className={styles.sizeRecommendation__container}>
    <div className={styles.sizeRecommendation__texts}>
      <p className={styles.sizeRecommendation__title}>Produto com caimento mais justo</p>
      <p className={styles.sizeRecommendation__subtitle}>Recomendamos escolher um tamanho acima</p>
    </div>
  </div>
)
const ClothesOriginal = () => (
  <div className={styles.sizeRecommendation__container}>
    <div className={styles.sizeRecommendation__texts}>
      <p className={styles.sizeRecommendation__title}>Produto fiel ao tamanho</p>
      <p className={styles.sizeRecommendation__subtitle}>Recomendamos seguir sua medida padrão</p>
    </div>
  </div>
)
const ClothesBig = () => (
  <div style={styles.sizeRecommendation__container}>
    <div style={styles.sizeRecommendation__texts}>
      <p style={styles.sizeRecommendation__title}>Produto com caimento maior</p>
      <p style={styles.sizeRecommendation__subtitle}>Recomendamos escolher um tamanho abaixo</p>
    </div>
  </div>
)

const SizeIndicationPdp = () => {
  const productContext = useProduct() || null
  // Estados para armazenar o tipo de produto e a recomendação de tamanho
  const [productType, setProductType] = useState(null)
  const [sizeRecommendation, setSizeRecommendation] = useState(null)

  // UseEffect para verificar o tipo de produto e recomendação de tamanho
  useEffect(() => {
    console.log('productContext Indicador de tamanho', productContext)

    if (productContext?.product?.properties) {
      const typeProduct = productContext.product.properties.find(
        each => each.name === 'Tipo de Produto'
      )?.values?.[0] || null

      const sizeRec = productContext.product.properties.find(
        each => each.name === 'Recomendação de tamanho'
      )?.values?.[0] || null

      console.log('typeProduct', typeProduct)
      console.log('sizeRecommendation', sizeRec)

      setProductType(typeProduct)
      setSizeRecommendation(sizeRec)
    }
  }, [productContext])

  // Função para renderizar o componente de recomendação
  const renderSizeComponent = () => {

    if (!productType || !sizeRecommendation) {
      return ''
    }

    if (productType === 'Tênis') {
      switch (sizeRecommendation) {
        case 'pequeno':
          return <ShoeSmall />
        case 'original':
          return <ShoeOriginal />
        case 'grande':
          return <ShoeBig />
        default:
          return ''
      }
    } else {
      switch (sizeRecommendation) {
        case 'pequeno':
          return <ClothesSmall />
        case 'original':
          return <ClothesOriginal />
        case 'grande':
          return <ClothesBig />
        default:
          return ''
      }
    }
  }

  return (
    <div>
      {renderSizeComponent()}
    </div>
  )
}

export default SizeIndicationPdp
