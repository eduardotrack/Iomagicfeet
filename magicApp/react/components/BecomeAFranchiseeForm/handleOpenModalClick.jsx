import { useCallback, useEffect } from 'react'
import { usePixel } from 'vtex.pixel-manager'

export function HandleOpenModalClick() {
  const { push } = usePixel()

  const handleOpenModal = useCallback(
    (e) => {
      e.stopPropagation()
      e.preventDefault()

      push({
        id: 'become-a-franchisee-form',
      })
    },
    [push]
  )

  useEffect(() => {
    const modalTriggers = document.querySelectorAll(
      '.vtex-store-components-3-x-infoCardCallActionContainer--home-our-ecosystem .vtex-button, .vtex-flex-layout-0-x-flexRow--franchisee-section-style .vtex-rich-text-0-x-wrapper--form-button-cta'
    )

    modalTriggers.forEach((modalTrigger) => {
      modalTrigger.addEventListener('click', handleOpenModal)
    })
  }, [handleOpenModal])

  return null
}
