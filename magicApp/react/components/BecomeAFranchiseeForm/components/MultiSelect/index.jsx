import React, { lazy, Suspense } from 'react'
// import Select from 'react-select'

const Select = lazy(() => import('react-select'))

import styles from './styles.css'

export function MultiSelect({ label, labelId, isMulti = true, ...props }) {
  return (
    <label
      htmlFor={labelId}
      className={styles.multiSelect}
      data-isMulti={isMulti || undefined}
    >
      <span>{label}</span>

      <Suspense fallback={() => <p>Loading...</p>}>
        <Select
          isMulti={isMulti}
          inputId={labelId}
          hideSelectedOptions={false}
          {...props}
          classNames={{
            input: () => styles.multiSelect_select_input,
            multiValue: () => styles.multiSelect_select_multiValue__item,
            multiValueLabel: () => styles.multiSelect_select_multiValue__label,
            control: ({ isFocused }) =>
              `${styles.multiSelect_select_inputContainer} ${
                isFocused ? styles.focused : ''
              } `,
            indicatorSeparator: () => styles.multiSelect_select_input_separator,
            dropdownIndicator: () => styles.multiSelect_select_input_arrow,
            valueContainer: () => styles.multiSelect_select_input_field,
            placeholder: () => styles.multiSelect_select_input_placeholder,
            menu: () => styles.multiSelect_select_menu,
            menuList: () => styles.multiSelect_select_menuList,
            group: () => styles.multiSelect_select_itemGroup,
            groupHeading: () => styles.multiSelect_select_itemGroup_title,
            option: ({ isFocused, isSelected }) =>
              `${styles.multiSelect_select_item} ${
                isSelected && styles.active
              } ${isFocused && styles.focused}`,
          }}
        />
      </Suspense>
    </label>
  )
}
