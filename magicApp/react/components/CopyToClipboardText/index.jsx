import React, { useState, useEffect, useCallback } from 'react'

import styles from './styles.css'

export function CopyToClipboardText({
  textToCopy,
  temporaryFeedbackMs = 2000,
  messageCopied = 'Copiado!',
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!textToCopy || copied) return

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
    } catch (err) {
      console.error('Falha ao copiar texto: ', err)
    }
  }, [textToCopy, copied])

  useEffect(() => {
    let timeoutId

    if (copied) {
      timeoutId = setTimeout(() => {
        setCopied(false)
      }, temporaryFeedbackMs)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [copied, temporaryFeedbackMs])

  const handleClickAndKeyPress = (event) => {
    if (
      event.type === 'click' ||
      (event.type === 'keypress' &&
        (event.key === 'Enter' || event.key === ' '))
    ) {
      handleCopy()
    }
  }

  if (!textToCopy) {
    return null
  }

  return (
    <div
      className={`${styles.copyTextContainer || ''} relative dib`}
      onClick={handleClickAndKeyPress}
      onKeyDown={handleClickAndKeyPress}
      role="button"
      tabIndex={0}
      aria-live="polite"
      aria-label={`Copiar texto: ${textToCopy}`}
      aria-describedby={copied ? 'copy-success-tooltip' : undefined}
    >
      <span className={`${styles.copyableText || ''} pointer`}>
        {textToCopy}
      </span>
      {copied && (
        <div
          id="copy-success-tooltip"
          className={`${styles.tooltip || ''} ${styles.tooltipVisible || ''}`}
          role="status"
        >
          {messageCopied}
        </div>
      )}
    </div>
  )
}

CopyToClipboardText.schema = {
  title: 'Texto Copiável com Tooltip',
  description:
    'Exibe um texto que pode ser copiado para a área de transferência ao ser clicado. Um tooltip de confirmação é exibido.',
  type: 'object',
  properties: {
    textToCopy: {
      title: 'Texto para Copiar',
      description: 'O texto que será exibido e copiado ao clicar.',
      type: 'string',
      default: '',
    },
    messageCopied: {
      title: 'Mensagem de Confirmação',
      description:
        'A mensagem que aparecerá no tooltip após copiar (ex: "Copiado!").',
      type: 'string',
      default: 'Copiado!',
    },
    temporaryFeedbackMs: {
      title: 'Duração do Feedback (ms)',
      description:
        'Quanto tempo (em milissegundos) o tooltip de confirmação ficará visível.',
      type: 'number',
      default: 2000,
    },
  },
}
