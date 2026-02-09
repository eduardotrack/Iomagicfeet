import { useEffect, useState } from "react"
import { NotifyModal } from "./NotifyModal"
import { SuccessModal } from "./SuccessModal"

const UNAVAILABLE_CLASS = 'vtex-store-components-3-x-unavailable'

export function NotifyUnavailableSku() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  function handleClick(e) {
    const unavailableButton = e.target.closest(`.${UNAVAILABLE_CLASS}`)
    if (!unavailableButton) return

    setIsNotifyOpen(true)
  }

 useEffect(() => {
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <>
      <NotifyModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        onSuccess={() => {
          setIsNotifyOpen(false)

          setTimeout(() => {
            setIsSuccessOpen(true)
          }, 150)
        }}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
    </>
  )
}
