import React, { useState, useMemo } from 'react'
import { useResponsiveValue } from 'vtex.responsive-values'
import { ModalHeader } from 'vtex.modal-layout'
import { CombinedProductList, QuerySchema } from '.'
import { index as RichText } from 'vtex.rich-text'
import { useCustomClasses } from 'vtex.css-handles'
import styles from './styles.css'
import miniModalStyles from './miniModal.css'
import ProductListWithCheckbox from './components/ProductListWithCheckbox'
import { ToastProvider } from '../ToastNotification/ToastContext'

export function CombinedProductListWithImage({ children, items, Slider, ...props }) {
  const cardsList = useMemo(() => items?.map(({ image, imageTablet, imageMobile, query, link, linkLabel, productIds }, index ) => (
    <CombinedProductListWithImageRender
      key={index}
      image={image}
      imageTablet={imageTablet}
      imageMobile={imageMobile}
      link={link}
      linkLabel={linkLabel}
      items={[{ query }]}
      productIds={productIds}
      {...props}
    />
    )), [items]
  )

  if (!items || items.length < 1) return null

  return <Slider>{cardsList}</Slider>
}

function CombinedProductListWithImageRender({
  ProductSummaryRenderDesktop,
  ProductSummaryRenderMobile,
  ModalTrigger,
  ModalContent,
  image,
  imageTablet,
  imageMobile,
  useModal,
  modalTitle,
  link,
  linkLabel,
  showButton,
  buttonText,
  productIds,
  ...props
}) {
  const [counter, setCounter] = useState(undefined)
  const [isMiniOpen, setIsMiniOpen] = useState(false)

  const canUseModal = useResponsiveValue(useModal)

  const ProductSummaryRender = useResponsiveValue({
    '(max-width: 990px)': ProductSummaryRenderMobile,
    desktop: ProductSummaryRenderDesktop,
  })

  const bannerSrc = useResponsiveValue({
    '(max-width: 640px)': imageMobile || image,
    '(max-width: 1119px)': imageTablet || image,
    desktop: image,
  })

  const customClasses = useCustomClasses(() => ({
    paragraph: styles.combinedProductListWithImage__linkLabel,
  }))

  const miniModal = (
    <div
      className={`${miniModalStyles.miniModalWrapper} ${
        isMiniOpen ? miniModalStyles['miniModalWrapper--open'] : ''
      }`}
      onClick={() => setIsMiniOpen(false)} // fecha ao clicar fora
    >
      <div
        className={`${miniModalStyles.miniModal} ${
          isMiniOpen ? miniModalStyles['miniModal--open'] : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ProductListWithCheckbox productIds={productIds} modalTitle={modalTitle} />
        <button className={miniModalStyles.miniModalClose} onClick={() => setIsMiniOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="#858999" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )

  const contentElement = (
    <div className={styles.combinedProductListWithImage__content}>
      <CombinedProductList
        {...props}
        getCounter={(value) => setCounter(value)}
        listType="none"
      >
        {canUseModal ? (
          <ModalContent>
            <ModalHeader></ModalHeader>
            <ProductListWithCheckbox productIds={productIds} modalTitle={modalTitle} />
            {/* <button className={miniModalStyles.miniModalClose} onClick={() => setIsMiniOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#858999" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button> */}
          </ModalContent>
        ) : (
          <>{ProductSummaryRender && <ProductSummaryRender />}</>
        )}
      </CombinedProductList>
    </div>
  )

  return (
    <div className={styles.combinedProductListWithImage__container}>
      <ToastProvider>
        {canUseModal ? (
          <ModalTrigger>
            <div className={styles.combinedProductListWithImage__banner}>
              <img src={bannerSrc} alt="Product Preview" />
              {showButton && buttonText ? (
                <button className={styles.combinedProductListWithImage__button}>{buttonText}</button>
              ) : null}
            </div>
            {contentElement}
          </ModalTrigger>
        ) : (
            <div className={styles.combinedProductListWithImage__item} style={{ position: 'relative' }}>
              <div className={styles.combinedProductListWithImage__banner}>
                <img src={bannerSrc} alt="Product Preview" />
                {showButton && buttonText ? (
                  <button className={styles.combinedProductListWithImage__button}>{buttonText}</button>
                ) : null}

                <div
                  className={miniModalStyles.triggerArea}
                  onClick={() => setIsMiniOpen((prev) => !prev)}
                />
              </div>

              <div className={miniModalStyles.miniModalWrapper}>
                {miniModal}
              </div>
            </div>
        )}

        <a href={link} className={styles.combinedProductListWithImage__link}>
          <RichText classes={customClasses} text={linkLabel} />
        </a>
      </ToastProvider>
    </div>
  )
}


CombinedProductListWithImage.schema = {
  title: 'Listagem de produtos',
  type: 'object',
  properties: {
    modalTitle: {
      type: 'string',
      title: 'Título da modal',
    },
    showButton: {
      type: 'boolean',
      title: 'Mostrar botão na imagem',
      default: true,
    },
    buttonText: {
      type: 'string',
      title: 'Texto do botão',
      default: 'ver look completo',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            title: 'Banner - Desktop',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          imageTablet: {
            type: 'string',
            title: 'Banner - Tablet',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          imageMobile: {
            type: 'string',
            title: 'Banner - Mobile',
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          productIds: {
            title: 'IDs dos produtos',
            type: 'array',
            description: 'Adicione os IDs dos produtos que serão exibidos nesta seção.',
            items: {
              type: 'string',
            },
          },
          link: {
            title: 'Link',
            description: 'Link para redirecionamento. Ex: /feminino',
            type: 'string',
          },
          linkLabel: {
            title: 'Texto do link',
            description: 'Texto que aparecerá no link. Ex: para meninas',
            type: 'string',
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
