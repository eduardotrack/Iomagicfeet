export function waitForElement(elementClass) {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelectorAll(elementClass)

      if (element.length > 0) {
        if (element.length > 1) {
          resolve(element)
        } else {
          resolve(element[0])
        }
        obs.disconnect()
      }
    })

    observer.observe(document, {
      childList: true,
      subtree: true,
    })
  })
}
