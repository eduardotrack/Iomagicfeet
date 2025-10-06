import { useEffect } from "react"

export default function MobileHeaderScrollControl() {
  useEffect(() => {
    const header = document.querySelector('.vtex-sticky-layout-0-x-container--header-mobile-sticky')
    if (!header) return

    let lastScrollTop = 0
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop

          if (scrollTop > lastScrollTop + 5) {
            // scroll down → esconde
            header.style.transform = 'translateY(-100%)'
            header.style.transition = 'transform 0.3s ease'
          } else if (scrollTop < lastScrollTop - 5) {
            // scroll up → mostra
            header.style.transform = 'translateY(0)'
            header.style.transition = 'transform 0.3s ease'
          }

          lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}
