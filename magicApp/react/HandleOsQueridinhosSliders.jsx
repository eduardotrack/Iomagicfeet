import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'

export default function App({ children }) {
  function handleLeftSlideClick() {
    const sliderBottomRightArrow = window?.document.querySelector(
      'button[class*="sliderRightArrow--slider-bottom"]'
    )

    sliderBottomRightArrow?.click()
  }

  function handleRightSlideClick() {
    const sliderBottomLeftArrow = window?.document.querySelector(
      'button[class*="sliderLeftArrow--slider-bottom"]'
    )

    sliderBottomLeftArrow?.click()
  }

  function handleContainerClick(e) {
    const elementClass = e.target?.classList.value

    if (elementClass.includes('sliderLeftArrow--slider-top')) {
      handleLeftSlideClick()

      return
    }

    if (elementClass.includes('sliderRightArrow--slider-top')) {
      handleRightSlideClick()

      return
    }
  }

  useEffect(() => {
    const slidersContainer = window.document.querySelector(
      '[class*="flexRow--home-week-featured"]'
    )

    slidersContainer?.addEventListener('click', handleContainerClick)

    return () => {
      slidersContainer?.removeEventListener('click', handleContainerClick)
    }
  }, [])

  return null
}
