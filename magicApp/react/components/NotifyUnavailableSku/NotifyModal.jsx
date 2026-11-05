import { useEffect, useRef, useState } from 'react'
import { EXPERIMENTAL_Modal } from 'vtex.styleguide'
import { useProduct } from 'vtex.product-context'
import { useDevice } from 'vtex.device-detector'
import { useRuntime } from 'vtex.render-runtime'
import { SimilarProductsShelf } from '../SimilarProductsShelf'
import styles from './styles.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SKU_PATTERN = /^[1-9]\d{0,19}$/

function normalizeSpecificationName(value) {
  return typeof value === 'string'
    ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    : ''
}

function isSizeSpecification(name) {
  return /^(tamanho|size)(\b|[_ -])/.test(normalizeSpecificationName(name))
}

function getUnavailableSizes(product, selectedItem) {
  const specifications = product?.skuSpecifications || []
  const sizeSpecification = specifications.find((specification) =>
    isSizeSpecification(specification?.field?.name || specification?.name)
  ) || (specifications.length === 1 ? specifications[0] : null)
  const sizeName = sizeSpecification?.field?.name || sizeSpecification?.name
  const options = []
  const items = product?.items || []

  items.forEach((item) => {
    const variation = item?.variations?.find((candidate) =>
      sizeName
        ? normalizeSpecificationName(candidate?.name) === normalizeSpecificationName(sizeName)
        : isSizeSpecification(candidate?.name)
    )
    const sizeValue = variation?.values?.[0]
    const sameOtherVariations = (selectedItem?.variations || []).every((selectedVariation) =>
      normalizeSpecificationName(selectedVariation?.name) === normalizeSpecificationName(variation?.name) ||
      item?.variations?.some((candidate) =>
        normalizeSpecificationName(candidate?.name) === normalizeSpecificationName(selectedVariation?.name) &&
        candidate?.values?.some((value) => selectedVariation?.values?.includes(value))
      )
    )
    const unavailable = item?.sellers?.length > 0 && item.sellers.every((seller) => {
      const offer = seller?.commertialOffer

      return offer && (offer.IsAvailable === false || offer.AvailableQuantity === 0)
    })

    if (
      typeof sizeValue === 'string' &&
      typeof item?.itemId === 'string' &&
      SKU_PATTERN.test(item?.itemId) &&
      sameOtherVariations &&
      unavailable &&
      !options.some((option) => option.name === sizeValue)
    ) {
      options.push({ name: sizeValue, skuId: item.itemId })
    }
  })

  return options
}

export function NotifyModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSizesOpen, setIsSizesOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState(isOpen)
  const submitting = useRef(false)

  const product = useProduct()
  const { device } = useDevice()
  const { rootPath = '' } = useRuntime()
  const normalizedRootPath = rootPath === '/' ? '' : rootPath.replace(/\/$/, '')
  const isDesktop = device === 'desktop'
  const skuId = product?.selectedItem?.itemId

  const sizes = getUnavailableSizes(product?.product, product?.selectedItem)
  const selectedSize = sizes.find((option) => option.name === size)

  function validateForm() {
    const newErrors = {}

    if (name.trim().length < 2 || name.trim().length > 100) {
      newErrors.name = 'Informe um nome entre 2 e 100 caracteres'
    }
    if (email.trim().length > 254 || !EMAIL_PATTERN.test(email.trim())) {
      newErrors.email = 'Informe um email válido'
    }
    if (!selectedSize) newErrors.size = 'Selecione um tamanho indisponível'
    if (!acceptTerms) newErrors.terms = 'Aceite os termos para continuar'

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  function clearFieldError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev

      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (submitting.current) return
    if (!validateForm()) return

    submitting.current = true
    setLoading(true)

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        skuId: selectedSize.skuId,
        acceptTerms: true,
      }

      const response = await fetch(`${normalizedRootPath}/_v/avise-me`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Não foi possível cadastrar o aviso')
      }

      const result = await response.json()

      if (result?.success !== true) {
        throw new Error('Cadastro não confirmado')
      }

      setEmail('')
      setName('')
      setSize('')
      setAcceptTerms(false)
      setErrors({})
      setIsSizesOpen(false)
      onSuccess()
    } catch {
      setErrors((previous) => ({
        ...previous,
        submit: 'Não foi possível cadastrar seu aviso. Tente novamente em instantes.',
      }))
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      return undefined
    }

    const timeout = setTimeout(() => setVisible(false), 200)
    return () => clearTimeout(timeout)
  }, [isOpen])

  return (
    <EXPERIMENTAL_Modal
      isOpen={visible}
      onClose={onClose}
      closeOnEsc
      className={`${styles.notifyUnavailableModal} ${!isOpen ? styles.notifyUnavailableModalClosing : ''}`}
    >
      <div className={styles.notifyUnavailableShelf}>
        <h3 className={styles.notifyUnavailableTitle}>Produtos similares</h3>
        <p className={styles.notifyUnavailableSubtitle}>
          Veja os produtos disponíveis
        </p>
        <SimilarProductsShelf
          key={skuId}
          slidesToShow={isDesktop ? 3 : 2}
          showArrows
          isFromNotifyUnavailable
        />
      </div>
      <form onSubmit={handleSubmit} className={styles.notifyUnavailableForm} aria-busy={loading}>
        <div className={styles.notifyUnavailableFormTop}>
          <p className={styles.notifyUnavailableFormTitle}>Avise-me quando chegar</p>
          <p className={styles.notifyUnavailableFormSubtitle}>Cadastre-se para ser informado quando este produto estiver disponível</p>
        </div>
        <div className={styles.notifyUnavailableInputWrapper}>
          <input
            name="name"
            type="text"
            placeholder="seu nome"
            value={name}
            maxLength={100}
            disabled={loading}
            autoComplete="name"
            onChange={(e) => {
              setName(e.target.value)
              clearFieldError('name')
            }}
            className={`${styles.notifyUnavailableInput} ${
              errors.name && styles.notifyUnavailableInputError
            }`}
          />
          {errors.name && (
            <span className={styles.notifyUnavailableError}>{errors.name}</span>
          )}
        </div>
        <div className={styles.notifyUnavailableInputWrapper}>
          <input
            name="email"
            type="email"
            placeholder="seu email"
            value={email}
            maxLength={254}
            disabled={loading}
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value)
              clearFieldError('email')
            }}
            className={`${styles.notifyUnavailableInput} ${
              errors.email && styles.notifyUnavailableInputError
            }`}
          />
          {errors.email && (
            <span className={styles.notifyUnavailableError}>
              {errors.email}
            </span>
          )}
        </div>
        <div className={styles.notifyUnavailableToggleWrapper}>
          <button
            type="button"
            disabled={loading || sizes.length === 0}
            aria-expanded={isSizesOpen}
            className={`${styles.notifyUnavailableToggleSizes} ${
              size && styles.notifyUnavailableToggleSizesSelected
            } ${errors.size && styles.notifyUnavailableInputError}`}
            onClick={() => setIsSizesOpen(!isSizesOpen)}
          >
            {size ? size : 'selecione o tamanho'}
          </button>
          <div
            className={`${styles.notifyUnavailableToggleSizesContent} ${
              isSizesOpen && styles.notifyUnavailableToggleSizesContentOpen
            }`}
          >
            {sizes.map((option) => (
              <button
                key={option.skuId}
                type="button"
                onClick={() => {
                  setSize(option.name)
                  setIsSizesOpen(false)
                  clearFieldError('size')
                }}
                disabled={loading || option.name === size}
                className={`
                  ${styles.notifyUnavailableToggleSizesSize} ${
                  option.name === size && styles.notifyUnavailableToggleSizesSizeActive
                }
                `}
              >
                {option.name}
              </button>
            ))}
          </div>
          {sizes.length === 0 && (
            <span className={styles.notifyUnavailableError}>
              Não há tamanhos indisponíveis para cadastrar um aviso neste momento.
            </span>
          )}
          {errors.size && (
            <span className={styles.notifyUnavailableError}>{errors.size}</span>
          )}
        </div>
        <div className={styles.notifyUnavailableTermsWrapper}>
          <label className={styles.notifyUnavailableTermsLabel}>
            <input
              type="checkbox"
              checked={acceptTerms}
              disabled={loading}
              onChange={(e) => {
                setAcceptTerms(e.target.checked)
                clearFieldError('terms')
              }}
              className={styles.notifyUnavailableTermsInput}
            />

            <span
              className={`${styles.notifyUnavailableTermsCheckbox} ${
                acceptTerms && styles.notifyUnavailableTermsCheckboxActive
              } ${errors.terms && styles.notifyUnavailableInputError}`}
            />

            <span className={styles.notifyUnavailableTermsText}>
              Aceito receber conteúdos da magicfeet e concordo com a Política de Privacidade
            </span>
          </label>
          {errors.terms && (
            <span className={styles.notifyUnavailableError}>
              {errors.terms}
            </span>
          )}
        </div>
        {errors.submit && (
          <span role="alert" className={styles.notifyUnavailableError}>
            {errors.submit}
          </span>
        )}
        <button
          type="submit"
          className={styles.notifyUnavailableSubmitButton}
          disabled={loading || sizes.length === 0}
        >
          {loading ? 'Cadastrando...' : 'avise-me'}
        </button>
      </form>
    </EXPERIMENTAL_Modal>
  )
}
