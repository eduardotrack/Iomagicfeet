import React, { useEffect, useRef } from 'react'

import styles from './style.css'

const CUSTOM_LIST_SELECTOR = '[data-custom-list="true"]'

const SLIDER_SELECTOR = '[class*="sliderLayoutContainer"]'

const PAGINATION_SELECTOR = '[class*="paginationDotsContainer"]'

type ObserverState = {
  observer: MutationObserver
  instances: number
}

const sliderObservers = new WeakMap<HTMLElement, ObserverState>()

const findSlider = (element: HTMLElement): HTMLElement | null => {
  const ownCustomList = element.closest<HTMLElement>(CUSTOM_LIST_SELECTOR)

  console.log('ccccccccccccccccc-->', ownCustomList);

  if (ownCustomList) {
    const slider = ownCustomList.querySelector<HTMLElement>(SLIDER_SELECTOR)

    if (slider) return slider
  }

  let parent = element.parentElement

  while (parent) {
    const customList = parent.matches(CUSTOM_LIST_SELECTOR)
      ? parent
      : parent.querySelector<HTMLElement>(CUSTOM_LIST_SELECTOR)

    const slider = customList?.querySelector<HTMLElement>(SLIDER_SELECTOR)

    if (slider) return slider

    parent = parent.parentElement
  }

  parent = element.parentElement

  while (parent) {
    const slider = parent.querySelector<HTMLElement>(SLIDER_SELECTOR)

    if (slider) return slider

    parent = parent.parentElement
  }

  return null
}

const applyProgressBar = (slider: HTMLElement) => {
  const pagination = slider.querySelector<HTMLElement>(PAGINATION_SELECTOR)

  if (pagination) {
    pagination.dataset.progressBar = 'true'
  }
}

const releaseObserver = (slider: HTMLElement) => {
  const state = sliderObservers.get(slider)

  if (!state) return

  state.instances -= 1

  if (state.instances <= 0) {
    state.observer.disconnect()
    sliderObservers.delete(slider)

    const pagination = slider.querySelector<HTMLElement>(PAGINATION_SELECTOR)

    pagination?.removeAttribute('data-progress-bar')
  }
}

const ProgressBar: React.FC = () => {
  const anchorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const anchor = anchorRef.current

    if (!anchor) return

    let activeSlider: HTMLElement | null = null

    let discoveryObserver: MutationObserver | null = null

    const attachToSlider = (slider: HTMLElement) => {
      if (activeSlider === slider) return

      if (activeSlider) {
        releaseObserver(activeSlider)
      }

      activeSlider = slider

      let state = sliderObservers.get(slider)

      if (!state) {
        const observer = new MutationObserver(() => {
          applyProgressBar(slider)
        })

        state = {
          observer,
          instances: 0,
        }

        sliderObservers.set(slider, state)

        observer.observe(slider, {
          childList: true,
          subtree: true,
        })
      }

      state.instances += 1

      applyProgressBar(slider)

      discoveryObserver?.disconnect()
      discoveryObserver = null
    }

    const searchForSlider = () => {
      const slider = findSlider(anchor)

      if (slider) {
        attachToSlider(slider)
      }
    }

    searchForSlider()

    if (!activeSlider) {
      discoveryObserver = new MutationObserver(() => {
        searchForSlider()
      })

      discoveryObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    }

    return () => {
      discoveryObserver?.disconnect()

      if (activeSlider) {
        releaseObserver(activeSlider)
      }
    }
  }, [])

  return (
    <div className={styles.progressBar}>
      <span ref={anchorRef} className={styles.anchor} aria-hidden="true" />
    </div>
  )
}

export default ProgressBar
