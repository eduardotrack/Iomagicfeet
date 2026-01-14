import { useEffect } from "react"
import { waitForElement } from "../../utils/waitForElement"

export function ApplyPlaceholderToCepInput() {
  async function waitForCepInput() {
    const cepInput = await waitForElement('.vtex-address-form-4-x-input')
    if (cepInput) {
      cepInput.placeholder = '00000-000'
    }
  }

  useEffect(() => {
    waitForCepInput()
  }, [])

  return <></>
}
