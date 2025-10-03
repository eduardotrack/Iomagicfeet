export function waitForElement(elementClass) {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(elementClass)

      if (element) {
        resolve(element)
        obs.disconnect()
      }
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
    })
  })
}
