import React, { useState, useRef } from 'react'
import Slider from 'react-slick'
import { index as RichText } from 'vtex.rich-text'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import styles from './styles.css'

export function ImageTextSlider({ items = [], slidesToShow = 3, sectionTitle = "navegue por **categoria**" }) {
  const [active, setActive] = useState(0)
  const sliderRef = useRef(null)

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 450,
    centerMode: true,
    centerPadding: "110px",
    slidesToShow,
    slidesToScroll: 1,
    afterChange: (current) => setActive(current),
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(2, slidesToShow) }
      },
      {
        breakpoint: 990,
        settings: {
          slidesToShow: 1,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          centerPadding: "30px",
        },
      }
    ]
  }

  return (
    <div className={styles.imageTextSlider__container}>
      <div className={styles.imageTextSlider__title}>
        <RichText text={sectionTitle} />
      </div>

      {items && items.length > 0 && (
        <>
          <div className={styles.imageTextSlider__sliderWrapper}>
            <Slider ref={sliderRef} {...settings} className={styles.imageTextSlider__slick}>
              {items.map((item, idx) => (
                <div key={idx} className={styles.imageTextSlider__slide} data-index={idx}>
                  <a href={item.link || '#'} className={styles.imageTextSlider__link}>
                    <img
                      src={item.image}
                      alt={item.text || `slide-${idx}`}
                      className={styles.imageTextSlider__image}
                      loading="lazy"
                    />
                  </a>
                </div>
              ))}
            </Slider>
          </div>

          <div className={styles.imageTextSlider__textContainer}>
            <div key={active} className={styles.imageTextSlider__textContent}>
              <RichText
                text={items[active]?.text || ''}
                textPosition='CENTER'
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}


ImageTextSlider.schema = {
  title: "Panda | Slider de Categorias",
  description: "Um slider com imagem + texto + link para categorias.",
  type: "object",
  properties: {
    slidesToShow: {
      title: "Slides visíveis",
      type: "number",
      default: 3
    },
    sectionTitle: {
      title: "Título do bloco",
      type: "string",
      default: "Navegue por categoria"
    },

    items: {
      type: "array",
      title: "Itens do slider",
      items: {
        type: "object",
        title: "Categoria",
        properties: {
          image: {
            title: "Imagem da categoria",
            type: "string",
            default: "",
            widget: {
              'ui:widget': 'image-uploader',
            },
          },
          text: {
            title: "Texto da categoria",
            type: "string",
            default: ""
          },
          link: {
            title: "Link da categoria",
            type: "string",
            default: ""
          }
        }
      }
    }
  }
}
