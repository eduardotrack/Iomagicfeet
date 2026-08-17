import React, { useMemo, useState, useEffect } from 'react'
import { Alert, Button, Modal, Checkbox } from 'vtex.styleguide'

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
    value: 'magicfeet',
    label: 'magicfeet',
  },
]

const haveExperienceTxt = [
  {
    value: 'Varejo Físico',
    label: 'Varejo Físico',
  },
  {
    value: 'Gestão de equipes',
    label: 'Gestão de equipes',
  },
  {
    value: 'Já operou algum negócio ou franquia',
    label: 'Já operou algum negócio ou franquia',
  },
]

const franchiseModel = [
  {
    value: 'diretamente',
    label: 'Pretendo operar diretamente a franquia',
  },
  {
    value: 'investidor',
    label: 'Pretendo ser investidor (ter um gerente/operador)',
  },
]

const equityCapital = [
  {
    value: 'Até R$ 700 mil',
    label: 'Até R$ 700 mil',
  },
  {
    value: 'de 700 mil a 1 milhão',
    label: 'de 700 mil a 1 milhão',
  },
  {
    value: 'Acima de 1 milhão',
    label: 'Acima de 1 milhão',
  },
]

const investmentIntention = [
  {
    value: 'Imediato',
    label: 'Imediato',
  },
  {
    value: 'De 3 a 6 meses',
    label: 'De 3 a 6 meses',
  },
  {
    value: 'Acima de 6 meses',
    label: 'Acima de 6 meses',
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
    handleInputChange,
    handleFormSubmit,
    setIsModalOpen,
  } = useRequestYourDataForm()

  const [citiesData, setCitiesData] = useState(null)

  const availableStates = useMemo(
    () =>
      BRAZILIAN_CITIES_BY_STATE.states.map((state) => ({
        label: state.name,
        value: state.name,
      })),
    []
  )

  useEffect(() => {
    import('./brazilianCitiesBySate').then((module) => {
      setCitiesData(module.BRAZILIAN_CITIES_BY_STATE)
    })
  }, [])

  const stateCityMap = useMemo(() => {
    if (!citiesData) return new Map()

    const map = new Map()

    citiesData.states.forEach((state) => {
      map.set(
        state.name,
        state.cities.map((city) => ({ value: city, label: city }))
      )
    })

    return map
  }, [citiesData])

  const availableCities = useMemo(() => {
    if (!formData?.interestState?.length) return []

    return formData.interestState.flatMap(
      (state) => stateCityMap.get(state) || []
    )
  }, [formData?.interestState, stateCityMap])

  if (!citiesData) {
    return <div>Carregando dados...</div>
  }

  function handleMultipleOptions(fieldName) {
    return (option) => {
      const selectedValues = option?.map((item) => item?.value) ?? []

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
        label="Telefone/WhatsApp"
        placeholder="Insira um número de telefone"
        value={formData.phone}
        onChange={(value) =>
          handleInputChange('phone', formatPhoneNumber(value))
        }
        errorMessage={formErrors?.phone}
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
        name="franchiseModel"
        isMulti={false}
        label="Qual modelo de franquia você tem interesse?"
        labelId="franchiseModel"
        options={franchiseModel}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => handleInputChange('franchiseModel', option.value)}
      />

      <MultiSelect
        name="equityCapital"
        isMulti={false}
        label="Qual capital próprio você possui disponível para investimento imediato?"
        labelId="equityCapital"
        options={equityCapital}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => handleInputChange('equityCapital', option.value)}
      />

      <MultiSelect
        name="haveExperienceTxt"
        isMulti={false}
        label="Possui experiência no varejo?"
        labelId="haveExperienceTxt"
        options={haveExperienceTxt}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('haveExperienceTxt', option.value)
        }
      />

      <MultiSelect
        name="investmentIntention"
        isMulti={false}
        label="Em quanto tempo você pretende investir na franquia?"
        labelId="investmentIntention"
        options={investmentIntention}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('investmentIntention', option.value)
        }
      />

      <Input
        name="franchiseInterest"
        required
        label="O que mais chamou sua atenção na oportunidade de franquia?"
        placeholder="Descreva sua resposta"
        value={formData.franchiseInterest}
        onChange={(value) => handleInputChange('franchiseInterest', value)}
        errorMessage={formErrors?.franchiseInterest}
        disabled={isLoading}
      />

      <div className={styles['becomeAFranchiseeForm-formMessage']}>
        {FormMessage && <FormMessage />}

        <Checkbox
          label="Concordo com a Política de Privacidade e em fornecer os meus dados pessoais ao Grupo Afeet."
          value="acceptTerms"
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
