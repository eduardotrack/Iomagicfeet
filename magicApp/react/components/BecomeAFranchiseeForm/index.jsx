import React, { useMemo } from 'react'
import { Alert, Button, Modal, Checkbox } from 'vtex.styleguide'

import Dropdown from '../Dropdown'
import Input from '../Input'
import { useRequestYourDataForm } from './useRequestYourDataForm'

import { MultiSelect } from './components/MultiSelect'
import styles from './styles.css'
import { BRAZILIAN_CITIES_BY_STATE } from './brazilianCitiesBySate'

const interestBrands = [
  {
    value: 'Authentic Feet',
    label: 'Authentic Feet',
  },
  {
    value: 'Artwalk',
    label: 'Artwalk',
  },
  {
    value: 'Magicfeet',
    label: 'magicfeet',
  },
]

const investmentCapacity = [
  {
    value: 'Abaixo 600k',
    label: 'Abaixo 600k',
  },
  {
    value: 'Entre 600k - 1M',
    label: 'Entre 600k - 1M',
  },
  {
    value: 'Acima de 1M',
    label: 'Acima de 1M',
  },
]
const haveExperience = [
  {
    value: true,
    label: 'Sim',
  },
  {
    value: false,
    label: 'Não',
  },
]

/**
 * Form to user request your information in the store
 *
 * @component
 */
export const BecomeAFranchiseeForm = ({ FormMessage }) => {
  const {
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
  } = useRequestYourDataForm()

  const availableStates = useMemo(
    () =>
      BRAZILIAN_CITIES_BY_STATE.states.map((state) => ({
        label: state.name,
        value: state.name,
      })),
    []
  )
  const availableCities = useMemo(
    () =>
      BRAZILIAN_CITIES_BY_STATE.states
        .filter((state) => formData?.interestState?.includes(state.name))
        .flatMap((state) =>
          state.cities.map((city) => ({ value: city, label: city }))
        ),
    [formData?.interestState]
  )

  function handleMultipleOptions(fieldName) {
    return (option) => {
      const selectedValues = option?.map((item) => item?.value)?.join(',') ?? ''

      handleInputChange(fieldName, selectedValues)
    }
  }

  const formatPhoneNumber = (value) => {
    if (!value) return value

    let phoneNumber = value.replace(/\D/g, '')
    phoneNumber = phoneNumber.replace(/\D/g, '')
    phoneNumber = phoneNumber.replace(/(^\d{2})(\d)/, '($1) $2')
    phoneNumber = phoneNumber.replace(/(\d{4,5})(\d{4}$)/, '$1-$2')

    return phoneNumber

    // if (phoneNumber.length <= 10) {
    //   return phoneNumber
    //     .replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    //     ?.slice(0, 15)
    // } else {
    //   return phoneNumber
    //     .replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
    //     ?.slice(0, 15)
    // }
  }

  const zipCodeMask = (value) => {
    if (!value) return ''
    value = value.replace(/\D/g, '')
    value = value.replace(/(\d{5})(\d)/, '$1-$2')

    return value
  }

  return (
    <form className={styles.becomeAFranchiseeForm} onSubmit={handleFormSubmit}>
      <Input
        name="name"
        required
        label="Nome Completo"
        placeholder="Insira seu nome completo"
        value={formData.name}
        onChange={(value) => handleInputChange('name', value)}
        errorMessage={formErrors?.name}
        disabled={isLoading}
      />
      <Input
        name="phone"
        type="tel"
        required
        label="Telefone"
        placeholder="Insira um número de telefone"
        value={formData.phone}
        onChange={(value) =>
          handleInputChange('phone', formatPhoneNumber(value))
        }
        errorMessage={formErrors?.name}
        disabled={isLoading}
      />
      <Input
        name="email"
        type="email"
        required
        label="E-mail"
        placeholder="Insira seu e-mail"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        errorMessage={formErrors?.name}
        disabled={isLoading}
      />

      <MultiSelect
        name="interestState"
        label="UF de interesse"
        labelId="interest-state"
        options={availableStates}
        isMulti
        placeholder="Selecione até 2 UF's"
        disabled={isLoading}
        onChange={handleMultipleOptions('interestState')}
        noOptionsMessage={() => 'Tente outra opção'}
      />

      <MultiSelect
        name="interestCity"
        label="Cidade de interesses"
        labelId="interest-city"
        noOptionsMessage={() =>
          formData?.interestState ? 'Tente outra opção' : 'Selecione um estado '
        }
        options={availableCities}
        isMulti
        placeholder="Selecione de 3-5 cidades"
        disabled={isLoading}
        onChange={handleMultipleOptions('interestCity')}
      />

      <MultiSelect
        name="interestBrand"
        isMulti={false}
        label="Marca de interesse"
        labelId="interest-brand"
        options={interestBrands}
        placeholder="Selecione o tipo de solicitação"
        disabled={isLoading}
        onChange={(option) => handleInputChange('interestBrand', option.value)}
      />

      <MultiSelect
        name="investmentCapacity"
        isMulti={false}
        label="Disponibilidade de investimento?"
        labelId="investmentCapacity"
        options={investmentCapacity}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('investmentCapacity', option.value)
        }
      />

      <MultiSelect
        name="haveExperience"
        isMulti={false}
        label="Possui experiência no varejo?"
        labelId="haveExperience"
        options={haveExperience}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => handleInputChange('haveExperience', option.value)}
      />

      <div className={styles['becomeAFranchiseeForm-formMessage']}>
        {FormMessage && <FormMessage />}

        <Checkbox
          label="Concordo com a Política de Privacidade e em fornecer os meus dados pessoais ao Grupo Afeet."
          value="acceptedTerms"
          name="acceptTerms"
          id="acceptTerms"
          checked={formData.acceptTerms}
          onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
        />

        {'acceptTerms' in (formErrors ?? {}) && (
          <Alert type="warning">
            É necessário aceitar os nossos termos para enviar o formulário
          </Alert>
        )}
      </div>

      <div className={styles['becomeAFranchiseeForm-formFooter']}>
        {isFormSuccessfullySubmitted ? (
          <Alert type="success">Seu formulário foi enviado com sucesso.</Alert>
        ) : (
          <Button type="submit" isLoading={isLoading}>
            Enviar
          </Button>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.message_modal_content}>
          {hasError ? (
            <>
              <h3 className={styles['becomeAFranchiseeForm-modalTitle']}>
                Aconteceu algo de errado!
              </h3>

              <p className={styles['becomeAFranchiseeForm-modalText']}>
                Houve um erro enquanto processávamos seus dados, tente novamente
                mais tarde
              </p>
            </>
          ) : (
            <>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1.25"
                  y="1.25"
                  width="37.5"
                  height="37.5"
                  rx="18.75"
                  stroke="#30A46C"
                  stroke-width="2.5"
                />
                <path
                  d="M10 20.7617L17 27.7617L30 13.2383"
                  stroke="#30A46C"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <h3 className={styles['becomeAFranchiseeForm-modalTitle']}>
                Formulário enviado com sucesso!
              </h3>
            </>
          )}
        </div>
      </Modal>
    </form>
  )
}
