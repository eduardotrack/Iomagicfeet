import { useState } from 'react'
import { INITIAL_FORM_STATE } from './constants'
import { saveDataRequestFile, sendDataRequest } from './service'

/**
 * return the object with state and handles to view component
 * @return  {
 * formData,
 * formErrors,
 * isLoading,
 * isModalOpen,
 * hasError,
 * isFormSuccessfullySubmitted,
 * handleFileInputChange,
 * handleInputChange,
 * handleFormSubmit,
 * setIsModalOpen, }
 */
export const useRequestYourDataForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [formErrors, setFormErrors] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [
    isFormSuccessfullySubmitted,
    setIsFormSuccessfullySubmitted,
  ] = useState(false)

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const isFormValid = validateForm()

    if (!isFormValid) return

    setIsLoading(true)
    setHasError(false)

    try {
      const documentData = await sendDataRequest(formData)
      setIsModalOpen(true)
      setIsFormSuccessfullySubmitted(true)
    } catch (error) {
      console.error("API ERROR::",{ error })
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const formValidation = {}

    Object.keys(formData).forEach((field) => {
      if(['haveExperience'].includes(field)) return

      const isFieldValid =
        field === 'acceptTerms'
          ? Boolean(formData[field])
          : formData[field]?.trim().length > 0

      if (!isFieldValid) formValidation[field] = 'Campo obrigatório!'
    })

    const isFormValid = Object.keys(formValidation).length === 0

    setFormErrors(isFormValid ? null : formValidation)

    return isFormValid
  }

  const handleInputChange = (name, value) => {
    setFormErrors(null)

    setFormData((oldState) => ({ ...oldState, [name]: value }))
  }

  const handleFileInputChange = (e) => {
    const [fileData] = e.target.files
    setFormData((oldState) => ({ ...oldState, documentFile: fileData }))
  }

  return {
    formData,
    formErrors,
    isLoading,
    isModalOpen,
    hasError,
    isFormSuccessfullySubmitted,
    handleFileInputChange,
    handleInputChange,
    handleFormSubmit,
    setIsModalOpen,
  }
}
