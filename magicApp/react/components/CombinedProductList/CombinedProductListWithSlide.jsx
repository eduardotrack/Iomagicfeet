import React, { useMemo, useRef, useState } from 'react'
import SwiperCore, { Navigation, Thumbs } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { canUseDOM } from 'vtex.render-runtime'
import { useResponsiveValue, useResponsiveValues } from 'vtex.responsive-values'
import { IconCaret } from 'vtex.store-icons'

import { CombinedProductList, QuerySchema } from '.'
import { getListCustomElement } from './components/ListBuilder'
import styles from './CombinedProductListWithSlide.styles.css'

import './swiper.global.css'

SwiperCore.use([Thumbs, Navigation])

export default function CombinedProductListWithSlide({
  children,
  items,
  ProductSummary,
  SectionTitle,
  imageDecoration,
  showThumbs: showThumbsResponsive,
  swiper: swiperResponsiveProps,
  itemsPerPage = 1,
  className = 'default',
  listType = 'image',
}) {
  const perPage = useResponsiveValue(itemsPerPage)
  const showThumbs = useResponsiveValue(showThumbsResponsive)
  const swiperProps = useResponsiveValues(swiperResponsiveProps || {})
  const swiperSlider = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const slideImages = useMemo(
    () =>
      items?.slice(0, 5).map((item) => {
        return getListCustomElement(item, listType)[0]
      }),
    [items]
  )

  const slideProducts = useMemo(
    () =>
      items?.slice(0, 5).map((item) => {
        return (
          <CombinedProductList
            key={`product-list-${item.image}`}
            ProductSummary={ProductSummary}
            items={[item]}
            listType="none"
          >
            {children}
          </CombinedProductList>
        )
      }),
    [items, children]
  )

  function renderArrowsContainer() {
    return (
      <div className={styles.slideWithProducts__slider__arrowsContainer}>
        <button
          className={`swiper-caret-prev ${styles.slideWithProducts__slider__arrow}`}
          data-orientation="left"
        >
          <IconCaret thin orientation="left" />
        </button>
        <button
          className={`swiper-caret-next ${styles.slideWithProducts__slider__arrow}`}
          data-orientation="right"
        >
          <IconCaret thin orientation="right" />
        </button>
      </div>
    )
  }

  function handleSlideChange() {
    if (perPage === 1 && swiperSlider.current) {
      setActiveIndex(
        swiperProps.loop
          ? swiperSlider.current.realIndex
          : swiperSlider.current.activeIndex
      )
    }
  }

  function handleThumbsClick(index) {
    return (e) => {
      e.stopPropagation()
      e.preventDefault()

      swiperSlider.current?.slideTo(index)
    }
  }

  return (
    <div className={`${styles.slideWithProducts__container} ${className}`}>
      {imageDecoration && (
        <img
          className={styles.slideWithProducts__textDecoration}
          src={imageDecoration}
          alt="Text decoration"
        />
      )}

      <div className={styles.slideWithProducts__leftContent}>
        {SectionTitle && <SectionTitle />}

        <div className={styles.slideWithProducts__productsList__container}>
          {slideProducts.map(
            (productList, index) =>
              activeIndex === index && (
                <div
                  key={index}
                  className={styles.slideWithProducts__productsList__item}
                >
                  {canUseDOM && productList}
                </div>
              )
          )}
        </div>
      </div>

      <div className={styles.slideWithProducts__slider__container}>
        <div className={styles.slideWithProducts__slider__wrapper}>
          {canUseDOM && (
            <>
              {renderArrowsContainer()}

              <Swiper
                navigation={{
                  prevEl: `.${styles.slideWithProducts__container}.${className} .swiper-caret-prev`,
                  nextEl: `.${styles.slideWithProducts__container}.${className} .swiper-caret-next`,
                  disabledClass: `c-disabled ${styles.carouselCursorDefault}`,
                }}
                className={styles.slideWithProducts__slider}
                spaceBetween={8}
                slidesPerView={perPage}
                onSlideChange={handleSlideChange}
                onSwiper={(swiper) => (swiperSlider.current = swiper)}
                initialSlide="2"
                {...swiperProps}
              >
                {slideImages.map((element, index) => (
                  <SwiperSlide
                    className={styles.slideWithProducts__slider__item}
                    key={`slide-${element}-${index}`}
                    data-is-active={activeIndex === index ? true : undefined}
                    onClick={() => setActiveIndex(index)}
                  >
                    {element}
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          )}
        </div>

        {showThumbs && (
          <div className={styles.slideWithProducts__slider__thumbs__container}>
            {slideImages.map((element, index) => (
              <div
                className={styles.slideWithProducts__slider__thumbs__item}
                onClick={handleThumbsClick(index)}
                data-is-active={activeIndex === index ? true : undefined}
                key={`thumb-${element}=${index}`}
              >
                {element}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

CombinedProductListWithSlide.schema = {
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
