import { useEffect, useState } from "react";
import { EXPERIMENTAL_Modal } from "vtex.styleguide";
import { useProduct } from "vtex.product-context";
import styles from "./styles.css";

export function NotifyModal({isOpen, onClose, shelf}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAbleToSubmit, setIsAbleToSubmit] = useState(false);
  const [isSizesOpen, setIsSizesOpen] = useState(false);

  const product = useProduct();

  const sizes = product?.product?.skuSpecifications[0]?.values?.map(item => {
    return item?.name
  });
  console.log(product)

  function getSkuIdBySize(sizeName) {
    return product?.product?.items?.find(item =>
      item?.variations?.some(variation =>
        variation?.values?.includes(sizeName)
      )
    )?.itemId
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!acceptTerms) return;

    try {
      setLoading(true);

      const skuId = getSkuIdBySize(size);

      const payload = {
        name,
        email,
        skuId
      }

      const response = await fetch('/api/dataentities/AS/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.log('Erro ao enviar dados do Avise-me para o Materdata:', error);
    } finally {
      setLoading(false);
      setEmail("");
      setName("");
      setSize("");
    }
  }

  useEffect(() => {
    if (email && name && size && acceptTerms) {
      setIsAbleToSubmit(true)
    }
  }, [email, name, size, acceptTerms])

  return (
    <EXPERIMENTAL_Modal
      isOpen={isOpen}
      onClose={onClose}
      title="produto similares"
      closeOnEsc
      className={styles.notifyUnavailableModal}
    >
      <p>Veja os produtos disponíveis</p>
      {shelf ? (
        <div>
          {shelf}
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className={styles.notifyUnavailableForm}>
        <input name="name" type="text" placeholder="seu nome" value={name} onChange={(e) => setName(e.target.value)} className={styles.notifyUnavailableInput} />
        <input name="email" type="email" placeholder="seu email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.notifyUnavailableInput} />
        <div className={styles.notifyUnavailableToggleWrapper}>
          <button type="button" className={`${styles.notifyUnavailableToggleSizes} ${size && styles.notifyUnavailableToggleSizesSelected}`} onClick={() => setIsSizesOpen(!isSizesOpen)}>
            {size ? size : "selecione o tamanho"}
          </button>
          <div className={`${styles.notifyUnavailableToggleSizesContent} ${isSizesOpen && styles.notifyUnavailableToggleSizesContentOpen}`}>
            {sizes?.map((s, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSize(s)} disabled={loading || s === size}
                className={`
                  ${styles.notifyUnavailableToggleSizesSize} ${s === size && styles.notifyUnavailableToggleSizesSizeActive}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.notifyUnavailableTermsWrapper}>
          <label className={styles.notifyUnavailableTermsLabel}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className={styles.notifyUnavailableTermsInput}
            />

            <span
              className={`${styles.notifyUnavailableTermsCheckbox} ${
                acceptTerms && styles.notifyUnavailableTermsCheckboxActive
              }`}
            />

            <span className={styles.notifyUnavailableTermsText}>
              Aceito receber conteúdos da magicfeet e concordo com a Política de Privacidade
            </span>
          </label>
        </div>
        <button
          type="submit"
          className={styles.notifyUnavailableSubmitButton}
          disabled={!isAbleToSubmit || loading}
        >
          avise-me
        </button>
      </form>
    </EXPERIMENTAL_Modal>
  )
}
