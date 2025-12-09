import React, { useMemo, useState } from 'react'
import { useResponsiveValue } from 'vtex.responsive-values'
import { ModalHeader } from 'vtex.modal-layout'
import { CombinedProductList, QuerySchema } from '.'
import { index as RichText } from 'vtex.rich-text'
import { useCustomClasses } from 'vtex.css-handles'
import styles from './styles.css'

export function CombinedProductListWithImage({
  children,
  items,
  Slider,
  ...props
}) {
  const cardsList = useMemo(
    () =>
      items?.map(
        (
          { image, imageTablet, imageMobile, query, link, linkLabel },
          index
        ) => (
          <CombinedProductListWithImageRender
            key={index}
            image={image}
            imageTablet={imageTablet}
            imageMobile={imageMobile}
            link={link}
            linkLabel={linkLabel}
            items={[{ query }]}
            {...props}
          />
        )
      ),
    [items]
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
  ...props
}) {
  const [counter, setCounter] = useState(undefined)
  const canUseModal = useResponsiveValue(useModal)
  const ProductSummaryRender = useResponsiveValue({
    '(max-width: 990px)': ProductSummaryRenderMobile,
    desktop: ProductSummaryRenderDesktop,
  })
  const bannerElementResposive = useResponsiveValue({
    '(max-width: 640px)': imageMobile,
    '(max-width: 1119px)': imageTablet,
    desktop: image,
  })

  const bannerElement =
    imageTablet && imageMobile ? (
      <img src={bannerElementResposive} alt="Product Preview" />
    ) : (
      <img src={image} alt="Product Preview" />
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
            <ModalHeader>{modalTitle}</ModalHeader>

            {ProductSummaryRender && <ProductSummaryRender />}
          </ModalContent>
        ) : (
          <>{ProductSummaryRender && <ProductSummaryRender />}</>
        )}
      </CombinedProductList>
    </div>
  )

  const customClasses = useCustomClasses(() => ({
    paragraph: styles.combinedProductListWithImage__linkLabel
  }))

  return (
    <div className={styles.combinedProductListWithImage__container}>
      {canUseModal ? (
        <ModalTrigger>
          <div className={styles.combinedProductListWithImage__banner}>
            {bannerElement}
          </div>

          {contentElement}
        </ModalTrigger>
      ) : (
        <div className={styles.combinedProductListWithImage__item}>
          <div className={styles.combinedProductListWithImage__banner}>
            {bannerElement}
          </div>
          {contentElement}
        </div>
      )}
      <a href={link} className={styles.combinedProductListWithImage__link}>
        <RichText classes={customClasses} text={linkLabel} />
      </a>
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