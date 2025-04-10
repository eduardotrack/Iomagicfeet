import React, { useEffect } from 'react'

export default function HandleOsQueridinhos() {
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
    const elementClass = e.target?.classList.value || ''

    if (elementClass.includes('sliderLeftArrow--slider-top')) {
      handleLeftSlideClick()
    }

    if (elementClass.includes('sliderRightArrow--slider-top')) {
      handleRightSlideClick()
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
