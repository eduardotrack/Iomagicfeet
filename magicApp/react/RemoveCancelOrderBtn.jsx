/* eslint-disable vtex/prefer-early-return */
import React, { useEffect } from 'react'

export default function RemoveCancelOrderBtn() {
  useEffect(() => {
    if (window.location.href.includes('account#')) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const cancelBtns = document.querySelectorAll(
              '.vtex-my-orders-app-3-x-cancelBtn'
            )

            const cancelBtnOrderDetail = document.querySelectorAll(
              '.vtex-account__order-details ul li'
            )

            if (cancelBtns.length > 0) {
              cancelBtns.forEach((btn) => btn.remove())
            }

            if (cancelBtnOrderDetail.length > 0) {
              cancelBtnOrderDetail.forEach((btn) => btn.remove())
            }
          }
        })
      })

      const targetNode = document.body

      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      })

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return <></>
}
