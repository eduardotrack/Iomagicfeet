import React, { useRef } from 'react'
import styles from './styles.css'
import useDropdown from './useDropdown'
import useClickOutside from '../../hooks/useClickOutside'

/**
 * Component to show the dropdown theme element
 *
 * @component
 * const label: Dropdown label on top
 * const placeholder: Label if doensn't have a value
 * const data: Array of elements
 * const value: Current value
 * const setValue: Set the value
 * const disabled: Disable the interactions
 */
const Dropdown = ({ label, placeholder = 'Selecione', data, value, setValue, disabled }) => {
  const inputContentRef = useRef()
  const { openDropdown, setOpenDropdown } = useDropdown(false)
  useClickOutside(inputContentRef, () => setOpenDropdown(false))

  return (
    <div ref={inputContentRef} className={`${styles.dropdown_content} ${disabled ? styles.dropdown_disabled : ''}`}>
      {label && (<span>{label}</span>)}

      <button
        onClick={(_) => setOpenDropdown(!openDropdown)}
        className={`${styles.dropdown_element} ${openDropdown || value ? styles.dropdown_element_active : ''}`}
      >
        <span>{value || placeholder}</span>

        {value ? (
          <button onClick={(_) => setValue()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
              <path d="M12.5 4L4.5 12M4.5 4L12.5 12" stroke="#121416" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
            <path d="M4.5 10L8.5 6L12.5 10" stroke="#121416" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        )}

      </button>

      <ul
        style={{ display: 'none' }}
        className={`${styles.dropdown_modal} ${openDropdown ? styles.dropdown_modal_active : ''}`}
      >
        {data && data?.map((item, index) => (
          <li key={index} className={value === item.__editorItemTitle ? styles.dropdown_selected : ''}>
            <button onClick={(_) => {
              setValue(item)
              setOpenDropdown(false)
            }}>
              <span>{item.__editorItemTitle}</span>

              {value === item.__editorItemTitle && (
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                  <path d="M3.83337 8.00008L7.16671 11.3334L13.8334 4.66675" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dropdown