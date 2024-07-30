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

        document.documentElement.style.scrollBehavior = 'smooth';

        const style = document.createElement('style');
        style.innerHTML = `
          :target {
            scroll-margin-top: 3em;
          }
        `;
        document.head.appendChild(style);

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
