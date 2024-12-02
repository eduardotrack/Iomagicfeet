import React from 'react'
import { components } from 'react-select'

import { IconArrowDown } from './icons/IconArrowDown'

export function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <IconArrowDown />
    </components.DropdownIndicator>
  )
}
