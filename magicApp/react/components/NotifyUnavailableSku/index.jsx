import { useEffect, useState } from "react"
import { waitForElement } from "../../utils/waitForElement"
import { NotifyModal } from "./NotifyModal"
import { SuccessModal } from "./SuccessModal"

const UNAVAILABLE_CLASS = 'vtex-store-components-3-x-unavailable'
const CONTAINER_CLASS = 'vtex-store-components-3-x-skuSelectorNameContainer'

export function NotifyUnavailableSku() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  function handleClick(e) {
    const unavailableButton = e.target.closest(`.${UNAVAILABLE_CLASS}`)
    if (!unavailableButton) return

    setIsNotifyOpen(true)
  }

  async function listenToClickOnContainer() {
    const container = await waitForElement(`.${CONTAINER_CLASS}`)
    if (!container) return

    container.addEventListener('click', handleClick)
  }

  useEffect(() => {
    listenToClickOnContainer()

    return () => {
      waitForElement(`.${CONTAINER_CLASS}`).then(container => {
        if (container) {
          container.removeEventListener('click', handleClick)
        }
      })
    }
  }, [])

  return (
    <>
      <NotifyModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        onSuccess={() => {
          setIsNotifyOpen(false)
          setIsSuccessOpen(true)
        }}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
    </>
  )
}
