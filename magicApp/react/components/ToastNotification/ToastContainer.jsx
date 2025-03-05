import React from 'react'

import style from './styles.css'

export function ToastContainer({ toasts }) {
  return (
    <div className={style[`toast-container`]}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${style.toast} ${style[`toast-${toast.type}`]}`}
        >
          <p className={style[`toast-message`]}>{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
