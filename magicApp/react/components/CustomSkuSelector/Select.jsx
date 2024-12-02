import React, { lazy, Suspense } from 'react'
const ReactSelect = lazy(() => import('react-select'))

import styles from './Select.styles.css'
import { DropdownIndicator } from './components/SelectArrow'

export function Select(props) {
  return (
    <Suspense fallback={() => <p>Loading...</p>}>
      <ReactSelect
        placeholder="Selecione"
        isSearchable={false}
        components={{ DropdownIndicator }}
        {...props}
        classNames={{
          menuPortal: () =>
            `${styles.reactSelect_menuPortal} ${props.className}`,
          container: () => styles.reactSelect_container,
          input: () => styles.reactSelect_select_input,
          multiValue: () => styles.reactSelect_select_multiValue__item,
          multiValueLabel: () => styles.reactSelect_select_multiValue__label,
          control: ({ isFocused }) =>
            `${styles.reactSelect_select_inputContainer} ${
              isFocused ? styles.focused : ''
            } `,
          indicatorSeparator: () => styles.reactSelect_select_input_separator,
          dropdownIndicator: () => styles.reactSelect_select_input_arrow,
          valueContainer: () => styles.reactSelect_select_input_field,
          placeholder: () => styles.reactSelect_select_input_placeholder,
          menu: () => styles.reactSelect_select_menu,
          menuList: () => styles.reactSelect_select_menuList,
          group: () => styles.reactSelect_select_itemGroup,
          groupHeading: () => styles.reactSelect_select_itemGroup_title,
          option: ({ isFocused, isSelected }) =>
            `${styles.reactSelect_select_item} ${isSelected && styles.active} ${
              isFocused && styles.focused
            }`,
        }}
      />
    </Suspense>
  )
}
