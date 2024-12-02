import { useState } from 'react'

/**
 * return the object with state and handles to view component
 * @return  {
 * useOnClickOutside,
 * openDropdown,
 * setOpenDropdown, }
 */
const useDropdown = () => {
  const [openDropdown, setOpenDropdown] = useState(false)

  return {
    openDropdown,
    setOpenDropdown,
  }
}

export default useDropdown
