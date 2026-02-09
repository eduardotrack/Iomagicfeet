import { useState, useEffect } from "react";
import { EXPERIMENTAL_Modal } from "vtex.styleguide";
import styles from "./successModalStyles.css";

export function SuccessModal({ isOpen, onClose }) {
  const [visible, setVisible] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
    } else {
      setTimeout(() => setVisible(false), 200)
    }
  }, [isOpen])

  return (
    <EXPERIMENTAL_Modal
      isOpen={visible}
      onClose={onClose}
      closeOnEsc
      className={`${styles.successModal} ${!isOpen ? styles.successModalClosing : ''}`}
    >
      <div className={styles.successModalWrapper}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 32L29.3333 37.3333L40 26.6667M8 32C8 35.1517 8.62078 38.2726 9.82689 41.1844C11.033 44.0962 12.8008 46.742 15.0294 48.9706C17.258 51.1992 19.9038 52.967 22.8156 54.1731C25.7274 55.3792 28.8483 56 32 56C35.1517 56 38.2726 55.3792 41.1844 54.1731C44.0962 52.967 46.742 51.1992 48.9706 48.9706C51.1992 46.742 52.967 44.0962 54.1731 41.1844C55.3792 38.2726 56 35.1517 56 32C56 28.8483 55.3792 25.7274 54.1731 22.8156C52.967 19.9038 51.1992 17.258 48.9706 15.0294C46.742 12.8008 44.0962 11.033 41.1844 9.82689C38.2726 8.62078 35.1517 8 32 8C28.8483 8 25.7274 8.62078 22.8156 9.82689C19.9038 11.033 17.258 12.8008 15.0294 15.0294C12.8008 17.258 11.033 19.9038 9.82689 22.8156C8.62078 25.7274 8 28.8483 8 32Z" stroke="#34C759" stroke-width="3.58333" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <div className={styles.successModalContent}>
          <p className={styles.successModalTitle}>aviso cadastrado!</p>
          <p className={styles.successModalSubtitle}>iremos notificá-lo assim que esse tamanho estiver disponível novamente</p>
        </div>

        <button onClick={onClose} className={styles.successModalButton}>
          entendi
        </button>
      </div>
    </EXPERIMENTAL_Modal>
  )
}
