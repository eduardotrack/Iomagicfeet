/* eslint-disable vtex/prefer-early-return */
import React, { useEffect } from 'react'

export default function RemoveCancelOrderBtn() {
  useEffect(() => {
    if (window.location.href.includes('account#')) {
      let cancelBtn
      let searchForBtnController = 0
      const searchForBtn = setInterval(() => {
        cancelBtn = document.querySelectorAll(
          '.vtex-my-orders-app-3-x-cancelBtn'
        )

        if (cancelBtn.length > 0) {
          cancelBtn.forEach((btn) => {
            btn.remove()
          })

          clearInterval(searchForBtn)
        }

        searchForBtnController++
        if (searchForBtnController > 10) {
          clearInterval(searchForBtn)
        }
      }, 500)
    }
  }, [])

  return <></>
}
