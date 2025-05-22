import { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import { ImageZoomModal } from './ImageZoomModal'

export function PDPZoomModal() {
  const [isModalOpen, setModalOpen] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  const { selectedItem } = useProduct()

  useEffect(() => {
    const selector = '.vtex-store-components-3-x-productImageTag'

    const handleClick = (e) => {
      const target = e.target
      if (target.matches(selector)) {
        const clickedSrc = target.src
        const images = selectedItem?.images || []

        const match = clickedSrc.match(/ids\/(\d+)-/)
        const imageId = match?.[1]

        if (imageId) {
          const index = images.findIndex(img => img.imageId === imageId)
          setImageIndex(index >= 0 ? index : 0)
        } else {
          setImageIndex(0)
        }

        setModalOpen(true)
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [selectedItem])

  const imageUrls = selectedItem?.images.map((image) => image.imageUrl) || []

  return (
    <ImageZoomModal
      isOpen={isModalOpen}
      onClose={() => setModalOpen(false)}
      initialIndex={imageIndex}
      images={imageUrls}
    />
  )
}
