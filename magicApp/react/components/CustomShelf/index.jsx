import React from 'react'
import Slider from 'react-slick'
import { useDevice } from 'vtex.device-detector'
import { useListContext } from 'vtex.list-context'
import styles from './styles.css'

export const CustomShelf = () => {
  const { device } = useDevice()
  const isDesktop = device === 'desktop'

  const listContext = useListContext()

  const items = listContext?.list || []

  console.log('panda CustomShelf items:', listContext)

  if (!items.length) return null

  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    speed: 400,

    swipe: true,
    draggable: true,
    touchMove: true,

    slidesToShow: isDesktop ? 4 : 2,
    slidesToScroll: isDesktop ? 4 : 2,
    centerPadding: '2px',

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2
        }
      }
    ]
  }

  return (
    <div className={styles.customShelfWrapper}>
      <Slider {...settings}>
        {items.map((item, index) => (
          <div key={index} className={styles.slide}>
            {item}
          </div>
        ))}
      </Slider>
    </div>
  )
}
