import { useEffect, useState } from "react"
import { waitForElement } from "../../utils/waitForElement";
import { NotifyModal } from "./NotifyModal";

const UNAVAILABLE_CLASS = 'vtex-store-components-3-x-unavailable'
const CONTAINER_CLASS = 'vtex-store-components-3-x-skuSelectorNameContainer'

export function NotifyUnavailableSku({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick(e) {
    const target = e.target

    const unavailableButton = target.closest(`.${UNAVAILABLE_CLASS}`)

    if (!unavailableButton) return

    e.preventDefault()
    e.stopPropagation()

    setIsOpen(true)
  }

  async function listenToClickOnContainer() {
    const container = await waitForElement(`.${CONTAINER_CLASS}`)

    if (!container) return

    container.addEventListener('click', handleClick)
  }

  useEffect(() => {
    listenToClickOnContainer()

    return () => {
      waitForElement(`.${CONTAINER_CLASS}`).then((container) => {
        if (container) {
          container.removeEventListener('click', handleClick)
        }
      })
    }
  }, [])

  console.log('panda', children)

  return (
    <NotifyModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      shelf={children}
    />
  )
}
