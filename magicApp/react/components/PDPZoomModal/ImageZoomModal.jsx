import { useState, useRef, useEffect } from 'react'
import styles from './ImageZoomModal.css'

export function ImageZoomModal({ isOpen, onClose, initialIndex, images }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const wrapperRef = useRef(null)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const clickStartRef = useRef({ x: 0, y: 0 })

  const resetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const clampPosition = (x, y) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return { x, y }

    const wrapperRect = wrapper.getBoundingClientRect()
    const scaledWidth = wrapper.offsetWidth * zoom
    const scaledHeight = wrapper.offsetHeight * zoom

    const maxX = (scaledWidth - wrapperRect.width) / 2
    const maxY = (scaledHeight - wrapperRect.height) / 2

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    }
  }

  const handleZoom = (delta) => {
    setZoom(prevZoom => {
      const newZoom = Math.max(1, Math.min(4, prevZoom + delta))
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const nextImage = () => {
    resetZoom()
    setCurrentIndex((currentIndex + 1) % images.length)
  }

  const prevImage = () => {
    resetZoom()
    setCurrentIndex((currentIndex - 1 + images.length) % images.length)
  }

  // Desktop
  const handleMouseDown = (e) => {
    if (isMobile) return

    if (zoom === 1) {
      setZoom(2)
      return
    }

    setDragging(true)
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    clickStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e) => {
    if (!dragging) return

    const dx = e.clientX - lastPointerRef.current.x
    const dy = e.clientY - lastPointerRef.current.y
    lastPointerRef.current = { x: e.clientX, y: e.clientY }

    setPosition(prev => clampPosition(prev.x + dx, prev.y + dy))
  }

  const handleMouseUp = (e) => {
    if (!dragging) return
    setDragging(false)

    const dx = e.clientX - clickStartRef.current.x
    const dy = e.clientY - clickStartRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 5 && !isMobile) {
      setZoom(prev => {
        const newZoom = prev === 1 ? 2 : 1
        if (newZoom === 1) setPosition({ x: 0, y: 0 })
        return newZoom
      })
    }
  }

  // Mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      lastPointerRef.current = { x: touch.clientX, y: touch.clientY }
      clickStartRef.current = { x: touch.clientX, y: touch.clientY }
      setDragging(true)
    }
  }

  const handleTouchMove = (e) => {
    if (!dragging || e.touches.length !== 1) return

    const touch = e.touches[0]
    const dx = touch.clientX - lastPointerRef.current.x
    const dy = touch.clientY - lastPointerRef.current.y
    lastPointerRef.current = { x: touch.clientX, y: touch.clientY }

    setPosition(prev => clampPosition(prev.x + dx, prev.y + dy))

    if (zoom > 1) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    setDragging(false)
    // Clique não ativa zoom no mobile
  }

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      resetZoom()
    }
  }, [initialIndex, isOpen])

  if (!isOpen) return null

  return (
    <div
      className={styles.modalOverlay__zoomPDP}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button className={styles.closeButton__zoomPDP} onClick={onClose}>×</button>

      <div className={styles.controls__zoomPDP}>
        <button onClick={() => handleZoom(-0.5)} disabled={zoom === 1}>-</button>
        <button onClick={() => handleZoom(0.5)} disabled={zoom === 4}>+</button>
      </div>

      <div className={styles.carouselContainer__zoomPDP}>
        <button onClick={prevImage} className={styles.navLeft__zoomPDP}></button>

        <div
          ref={wrapperRef}
          className={`${styles.imageWrapper__zoomPDP} ${zoom !== 1 && styles.imageWrapperMinus__zoomPDP}`}
          onMouseDown={handleMouseDown}
        >
          <img
            src={images[currentIndex]}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom === 1 ? 'zoom-in' : dragging ? 'grabbing' : 'grab',
              touchAction: 'none'
            }}
            className={styles.modalImage__zoomPDP}
            draggable={false}
          />
        </div>

        <button onClick={nextImage} className={styles.navRight__zoomPDP}></button>
      </div>
    </div>
  )
}
