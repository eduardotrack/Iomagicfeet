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

const haveExperience = [
  {
    value: 'openInput - Sim',
    label: 'Sim',
  },
  {
    value: 'Não',
    label: 'Não',
  },
]

const professionalProfile = [
  {
    value: 'Empresário',
    label: 'Empresário',
  },
  {
    value: 'Investidor',
    label: 'Investidor',
  },
  {
    value: 'Executivo',
    label: 'Executivo',
  },
  {
    value: 'C-Level',
    label: 'C-Level',
  },
  {
    value: 'Gestor / gerente',
    label: 'Gestor / gerente',
  },
  {
    value: 'Autônomo',
    label: 'Autônomo',
  },
  {
    value: 'Profissional liberal',
    label: 'Profissional liberal',
  },
  {
    value: 'Outro',
    label: 'Outro',
  },
]

const operatingModel = [
  {
    value: 'Operador',
    label: 'Operador (vou tocar a loja)',
  },
  {
    value: 'Sócio-operador',
    label: 'Sócio-operador',
  },
  {
    value: 'Investidor',
    label: 'Investidor (terei gestor)',
  },
]

const equityCapital = [
  {
    value: 'Abaixo de R$ 700 mil',
    label: 'Abaixo de R$ 700 mil',
  },
  {
    value: 'R$ 700 mil – R$ 1 milhão',
    label: 'R$ 700 mil – R$ 1 milhão',
  },
  {
    value: 'Acima de R$ 1 milhão',
    label: 'Acima de R$ 1 milhão',
  },
]

const capitalOrigin = [
  {
    value: 'Recursos próprios',
    label: 'Recursos próprios',
  },
  {
    value: 'Venda de ativo',
    label: 'Venda de ativo',
  },
  {
    value: 'Sociedade',
    label: 'Sociedade',
  },
  {
    value: 'Financiamento bancário',
    label: 'Financiamento bancário',
  },
  {
    value: 'Ainda avaliando',
    label: 'Ainda avaliando',
  },
]

const investmentIntention = [
  {
    value: 'Imediatamente (0–3 meses)',
    label: 'Imediatamente (0–3 meses)',
  },
  {
    value: 'Curto prazo (3–6 meses)',
    label: 'Curto prazo (3–6 meses)',
  },
  {
    value: 'Médio prazo (6–12 meses)',
    label: 'Médio prazo (6–12 meses)',
  },
  {
    value: 'Apenas pesquisando oportunidades',
    label: 'Apenas pesquisando oportunidades',
  },
]

const businessExperience = [
  {
    value: 'openInput - Sim, franquia (quais)',
    label: 'Sim, franquia',
  },
  {
    value: 'openInput - Sim, negócio próprio (quais)',
    label: 'Sim, negócio próprio',
  },
  {
    value: 'openInput - Sim, gestão em varejo (quais)',
    label: 'Sim, gestão em varejo',
  },
  {
    value: 'Não',
    label: 'Não',
  },
]

const leadershipEmployees = [
  {
    value: 'Nenhum',
    label: 'Nenhum',
  },
  {
    value: '1–5',
    label: '1–5',
  },
  {
    value: '5–10',
    label: '5–10',
  },
  {
    value: '10+',
    label: '10+',
  },
]

const exPhysicalRetail = [
  {
    value: 'openInput - Sim (qual)',
    label: 'Sim',
  },
  {
    value: 'Não',
    label: 'Não',
  },
  {
    value: 'openInput - Indireta (qual)',
    label: 'Possuo experiência em nível societário/estratégico',
  },
]

const franchiseRegion = [
  {
    value: 'Já possuo ponto comercial',
    label: 'Já possuo ponto comercial',
  },
  {
    value: 'Shopping center',
    label: 'Shopping center',
  },
  {
    value: 'Rua / bairro comercial',
    label: 'Rua / bairro comercial',
  },
  {
    value: 'Ainda avaliando',
    label: 'Ainda avaliando',
  },
]

const visitedOurFranchise = [
  {
    value: 'Sim',
    label: 'Sim',
  },
  {
    value: 'Não',
    label: 'Não',
  },
]

const discoveredOpportunity = [
  {
    value: 'LinkedIn',
    label: 'LinkedIn',
  },
  {
    value: 'Instagram',
    label: 'Instagram',
  },
  {
    value: 'Indicação',
    label: 'Indicação',
  },
  {
    value: 'Pesquisa',
    label: 'Pesquisa',
  },
  {
    value: 'Google',
    label: 'Google',
  },
  {
    value: 'Evento / feira',
    label: 'Evento / feira',
  },
  {
    value: 'Outro',
    label: 'Outro',
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

  const shouldOpenInput = (value) => {
    return value?.includes('openInput')
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
        name="haveExperience"
        isMulti={false}
        label="Possui experiência no varejo?"
        labelId="haveExperience"
        options={haveExperience}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => handleInputChange('haveExperience', option.value)}
      />
      {formData?.haveExperience &&
        shouldOpenInput(formData?.haveExperience) && (
          <Input
            name="businessExperienceDetail"
            label="Descreva"
            placeholder="Descreva aqui"
            value={formData.businessExperienceDetail || ''}
            onChange={(value) =>
              handleInputChange('businessExperienceDetail', value)
            }
            disabled={isLoading}
          />
        )}

      <MultiSelect
        name="professionalProfile"
        isMulti={false}
        label="Qual seu perfil profissional atualmente?"
        labelId="professionalProfile"
        options={professionalProfile}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('professionalProfile', option.value)
        }
      />

      <MultiSelect
        name="operatingModel"
        isMulti={false}
        label="Você pretende operar a franquia diretamente ou ser investidor?"
        labelId="operatingModel"
        options={operatingModel}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => handleInputChange('operatingModel', option.value)}
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
        name="capitalOrigin"
        isMulti={false}
        label="A origem do capital é:"
        labelId="capitalOrigin"
        options={capitalOrigin}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => handleInputChange('capitalOrigin', option.value)}
      />

      <MultiSelect
        name="investmentIntention"
        isMulti={false}
        label="Quando pretende investir?"
        labelId="investmentIntention"
        options={investmentIntention}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('investmentIntention', option.value)
        }
      />

      <MultiSelect
        name="businessExperience"
        isMulti={false}
        label="Você já operou algum negócio ou franquia?"
        labelId="businessExperience"
        options={businessExperience}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => {
          const value = option.value.replace('openInput - ', '')
          handleInputChange('businessExperience', value)
        }}
      />
      {shouldOpenInput(formData.businessExperience) && (
        <Input
          name="businessExperienceDetail"
          label="Quais?"
          placeholder="Descreva aqui"
          value={formData.businessExperienceDetail || ''}
          onChange={(value) =>
            handleInputChange('businessExperienceDetail', value)
          }
          disabled={isLoading}
        />
      )}

      <MultiSelect
        name="leadershipEmployees"
        isMulti={false}
        label="Quantos funcionários você já liderou diretamente?"
        labelId="leadershipEmployees"
        options={leadershipEmployees}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('leadershipEmployees', option.value)
        }
      />

      <MultiSelect
        name="exPhysicalRetail"
        isMulti={false}
        label="Você possui experiência em varejo físico?"
        labelId="exPhysicalRetail"
        options={exPhysicalRetail}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) => {
          const value = option.value.replace('openInput - ', '')
          handleInputChange('exPhysicalRetail', value)
        }}
      />
      {shouldOpenInput(formData.exPhysicalRetail) && (
        <Input
          name="exPhysicalRetailDetail"
          label="Quais?"
          placeholder="Descreva aqui"
          value={formData.exPhysicalRetailDetail || ''}
          onChange={(value) =>
            handleInputChange('exPhysicalRetailDetail', value)
          }
          disabled={isLoading}
        />
      )}

      <MultiSelect
        name="franchiseRegion"
        isMulti={false}
        label="Onde pretende abrir sua franquia?"
        labelId="franchiseRegion"
        options={franchiseRegion}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('franchiseRegion', option.value)
        }
      />

      <MultiSelect
        name="visitedOurFranchise"
        isMulti={false}
        label="Você já visitou alguma loja da marca?"
        labelId="visitedOurFranchise"
        options={visitedOurFranchise}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('visitedOurFranchise', option.value)
        }
      />

      <MultiSelect
        name="discoveredOpportunity"
        isMulti={false}
        label="Como conheceu a oportunidade de franquia?"
        labelId="discoveredOpportunity"
        options={discoveredOpportunity}
        placeholder="Selecione"
        disabled={isLoading}
        onChange={(option) =>
          handleInputChange('discoveredOpportunity', option.value)
        }
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
