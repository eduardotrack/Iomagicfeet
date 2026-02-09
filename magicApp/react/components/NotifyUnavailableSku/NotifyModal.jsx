import { useState, useEffect } from "react";
import { EXPERIMENTAL_Modal } from "vtex.styleguide";
import { useProduct } from "vtex.product-context";
import { useDevice } from "vtex.device-detector";
import { SimilarProductsShelf } from "../SimilarProductsShelf";
import styles from "./styles.css";

export function NotifyModal({isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSizesOpen, setIsSizesOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(isOpen)

  const product = useProduct();
  const { device } = useDevice();
  const isDesktop = device === 'desktop'

  const sizes = product?.product?.skuSpecifications[0]?.values?.map(item => {
    return item?.name
  });
  console.log(product)

  function validateForm() {
    const newErrors = {}

    if (!name) newErrors.name = "Informe seu nome"
    if (!email) newErrors.email = "Informe seu email"
    if (!size) newErrors.size = "Selecione um tamanho"
    if (!acceptTerms) newErrors.terms = "Aceite os termos para continuar"

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  function clearFieldError(field) {
    setErrors(prev => {
      if (!prev[field]) return prev

      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  function getSkuIdBySize(sizeName) {
    return product?.product?.items?.find(item =>
      item?.variations?.some(variation =>
        variation?.values?.includes(sizeName)
      )
    )?.itemId
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      const skuId = getSkuIdBySize(size)

      const payload = {
        name,
        email,
        skuId,
        createdAt: new Date().toISOString(),
      }

      await fetch('/api/dataentities/AS/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      onSuccess()
    } catch (error) {
      console.log('Erro ao enviar dados:', error)
    } finally {
      setLoading(false)
      setEmail("")
      setName("")
      setSize("")
      setAcceptTerms(false)
      setErrors({})
    }
  }

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
    } else {
      setTimeout(() => setVisible(false), 200)
    }
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
          slidesToShow={isDesktop ? 3 : 2}
          showArrows
          isFromNotifyUnavailable
        />
      </div>
      <form onSubmit={handleSubmit} className={styles.notifyUnavailableForm}>
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
            onChange={(e) => {
              setName(e.target.value)
              clearFieldError('name')
            }}
            className={`${styles.notifyUnavailableInput} ${errors.name && styles.notifyUnavailableInputError}`}
          />
          {errors.name && <span className={styles.notifyUnavailableError}>{errors.name}</span>}
        </div>
        <div className={styles.notifyUnavailableInputWrapper}>
          <input
            name="email"
            type="email"
            placeholder="seu email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearFieldError('email')
            }}
            className={`${styles.notifyUnavailableInput} ${errors.email && styles.notifyUnavailableInputError}`}
          />
          {errors.email && <span className={styles.notifyUnavailableError}>{errors.email}</span>}
        </div>
        <div className={styles.notifyUnavailableToggleWrapper}>
          <button type="button" className={`${styles.notifyUnavailableToggleSizes} ${size && styles.notifyUnavailableToggleSizesSelected} ${errors.size && styles.notifyUnavailableInputError}`} onClick={() => setIsSizesOpen(!isSizesOpen)}>
            {size ? size : "selecione o tamanho"}
          </button>
          <div className={`${styles.notifyUnavailableToggleSizesContent} ${isSizesOpen && styles.notifyUnavailableToggleSizesContentOpen}`}>
            {sizes?.map((s, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSize(s)
                  clearFieldError('size')
                }}
                disabled={loading || s === size}
                className={`
                  ${styles.notifyUnavailableToggleSizesSize} ${s === size && styles.notifyUnavailableToggleSizesSizeActive}
                `}
              >
                {s}
              </button>
            ))}
          </div>
          {errors.size && <span className={styles.notifyUnavailableError}>{errors.size}</span>}
        </div>
        <div className={styles.notifyUnavailableTermsWrapper}>
          <label className={styles.notifyUnavailableTermsLabel}>
            <input
              type="checkbox"
              checked={acceptTerms}
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
          {errors.terms && <span className={styles.notifyUnavailableError}>{errors.terms}</span>}
        </div>
        <button
          type="submit"
          className={styles.notifyUnavailableSubmitButton}
          disabled={loading}
        >
          avise-me
        </button>
      </form>
    </EXPERIMENTAL_Modal>
  )
}
