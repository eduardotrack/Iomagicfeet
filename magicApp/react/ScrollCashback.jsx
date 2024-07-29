import React, { useEffect } from 'react'

function ScrollCashback() {
  useEffect(() => {
    const bannerElement = document.querySelector(
      '.vtex-store-components-3-x-imageElementLink--banner-principal-topo'
    )
    const linkElement = document.querySelector(
      '.vtex-store-link-0-x-link--botao-link-cashback'
    )
    const spanElement = document.querySelector(
      'vtex-store-link-0-x-label--botao-link-cashback'
    )

    const element = bannerElement || linkElement || spanElement

    if (element) {
      element.addEventListener('click', (e) => {
        e.preventDefault()
        console.log(e.target)

        const isBanner = e.target.classList.contains(
          'vtex-store-components-3-x-imageElement--banner-principal-topo'
        )
        const isLink = e.target.classList.contains(
          'vtex-store-link-0-x-link--botao-link-cashback'
        )

        const isSpan = e.target.classList.contains(
          'vtex-store-link-0-x-label--botao-link-cashback'
        )

        if (isBanner || isLink || isSpan) {
          console.log('click')
          console.log(isBanner, isLink, isSpan)

          const id =
            e.target.getAttribute('href') ||
            e.target.parentElement.getAttribute('href')
          console.log(id)
          if (id) {
            document.querySelector(id).scrollIntoView({ behavior: 'smooth' })
          }
        }
      })
    }

    return () => {
      if (element) {
        element.removeEventListener('click', () => {})
      }
    }
  }, [])

  return <></>
}

export default ScrollCashback
