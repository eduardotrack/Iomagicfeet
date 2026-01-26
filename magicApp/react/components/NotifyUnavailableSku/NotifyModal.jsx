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

  // TODO: pegar todos os tamanhos
  const sizes = product?.product?.skuSpecifications[0]?.values?.map(item => {
    return item?.name
  });
  console.log(product)

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // TODO: conectar com MasterData
    setTimeout(() => {
      setLoading(false);
      onClose();
      setEmail("");
      setName("");
      setSize("");
    }, 1000)
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
        <input type="text" placeholder="seu nome" value={name} onChange={(e) => setName(e.target.value)} className={styles.notifyUnavailableInput} />
        <input type="email" placeholder="seu email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.notifyUnavailableInput} />
        <div className={styles.notifyUnavailableToggleWrapper}>
          <button type="button" className={styles.notifyUnavailableToggleSizes} onClick={() => setIsSizesOpen(!isSizesOpen)}>
            selecione o seu tamanho
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
        <div>
          <button
            type="button"
            onClick={() => setAcceptTerms(true)}
          />
          <p>Aceito receber conteúdos da magicfeet e concordo com a Política de Privacidade</p>
        </div>
        <button
          type="submit"
          disabled={!isAbleToSubmit || loading}
        >
          avise-me
        </button>
      </form>
    </EXPERIMENTAL_Modal>
  )
}
