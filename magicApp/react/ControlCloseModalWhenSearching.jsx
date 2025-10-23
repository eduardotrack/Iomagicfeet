import { useEffect } from 'react'

export default function ControlCloseModalWhenSearching() {
  useEffect(() => {
    const closeModal = () => {
      // desfoca o input ativo, se houver (fecha o teclado)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }

      // fecha o modal de busca, se existir
      const btn = document.querySelector(
        '.vtex-store-drawer-0-x-closeIconButton--header__drawer--search'
      )
      if (btn) btn.click()
    }

    const handleUrlChange = () => closeModal()

    // sobrescreve pushState e replaceState pra escutar mudanças de URL SPA
    const pushState = history.pushState
    const replaceState = history.replaceState

    history.pushState = function (...args) {
      pushState.apply(history, args)
      window.dispatchEvent(new Event('urlchange'))
    }
    history.replaceState = function (...args) {
      replaceState.apply(history, args)
      window.dispatchEvent(new Event('urlchange'))
    }

    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('urlchange', handleUrlChange)

    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('urlchange', handleUrlChange)
      history.pushState = pushState
      history.replaceState = replaceState
    }
  }, [])

  return null
}
