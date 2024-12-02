import React from 'react'
import { index as RichText } from 'vtex.rich-text'
import { useCustomClasses } from 'vtex.css-handles'

import styles from '../styles.css'

export function TextCard({ data }) {
  const customClasses = useCustomClasses(() => ({
    paragraph: styles.combinedProductList__textCard__paragraph,
    heading: styles.combinedProductList__textCard__title,
  }))

  const formattedMessage = `<span class="${styles.combinedProductList__textCard__title}"> ${data.title} </span>`

  return (
    <div
      className={styles.combinedProductList__textCard}
      style={{ '--text-bg': data.textBg }}
    >
      {data.logo && (
        <img
          className={styles.combinedProductList__textCard__logo}
          src={data.logo}
          alt="Logo"
          width={60}
        />
      )}

      <RichText classes={customClasses} text={formattedMessage} />
    </div>
  )
}
