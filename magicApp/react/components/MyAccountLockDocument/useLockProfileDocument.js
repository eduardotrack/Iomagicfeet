import { useEffect } from 'react'

import { MY_ACCOUNT_PAGE_ID } from './constants'

const DOCUMENT_INPUT_SELECTOR =
  '[class*="profileForm-document"] input[name="document"]'

const EDITED_FLAG = 'data-document-user-edited'
const LISTENER_FLAG = 'data-document-listener'

/**
 * Desabilita o input de CPF no My Account quando o cliente já possui CPF cadastrado.
 * Sem CPF, o campo permanece editável.
 *
 * O valor chega de forma assíncrona e o input pode já vir com foco, então não dá para
 * usar foco como critério. Em vez disso, marcamos o input quando o usuário digita
 * (evento confiável) e só bloqueamos valores que NÃO vieram de digitação,
 * ou seja, que vieram do cadastro.
 */
export function useLockProfileDocument(page) {
  useEffect(() => {
    if (page !== MY_ACCOUNT_PAGE_ID) return

    const lockIfRegistered = () => {
      const input = document.querySelector(DOCUMENT_INPUT_SELECTOR)

      if (!input || input.disabled) return

      if (!input.hasAttribute(LISTENER_FLAG)) {
        input.setAttribute(LISTENER_FLAG, 'true')
        input.addEventListener('input', (event) => {
          if (event.isTrusted) input.setAttribute(EDITED_FLAG, 'true')
        })
      }

      if (input.hasAttribute(EDITED_FLAG)) return

      if (input.value && input.value.trim() !== '') {
        input.disabled = true
        input.title = 'CPF já cadastrado e não pode ser alterado'
        input.style.backgroundColor = '#e3e4e6'
        input.style.color = '#585959'
        input.style.cursor = 'not-allowed'
      }
    }

    const interval = setInterval(lockIfRegistered, 300)

    return () => clearInterval(interval)
  }, [page])
}
