import React from 'react'

import styles from './styles.css'

/**
 * Component to show the input theme element
 *
 * @component
 * const label: Label on top
 * const placeholder: Label if doensn't have a value
 * const value: Current value
 * const onChange: Set the value
 * const disabled: Disable the interactions
 */
const Input = ({
  label,
  value,
  placeholder,
  onChange,
  disabled,
  type = 'text',
  ...props
}) => {
  const defaultProps = {
    placeholder,
    className: styles.input_element,
    value,
    type,
    disabled,
    onChange: (e) => onChange(e.target.value),
  }

  return (
    <label
      className={`${styles.input_content} ${
        disabled ? styles.input_disabled : ''
      }`}
    >
      {label && <span>{label}</span>}

      {type === 'textarea' ? (
        <textarea {...defaultProps} {...props} />
      ) : (
        <input {...defaultProps} {...props} />
      )}
    </label>
  )
}

export default Input
