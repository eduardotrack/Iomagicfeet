import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import styles from './styles.css'

export const NossasLojas = () => {
  const [lojas, setLojas] = useState([])
  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  const [cidades, setCidades] = useState([])
  const [loading, setLoading] = useState(false)
  const [dropdownAberto, setDropdownAberto] = useState(null) // "estado" | "cidade" | null

  const estados = [
    // { value: '', text: 'selecione o estado' },
    { value: 'AM', text: 'AM' },
    { value: 'ES', text: 'ES' },
    { value: 'MA', text: 'MA' },
    { value: 'MG', text: 'MG' },
    { value: 'PE', text: 'PE' },
    { value: 'PI', text: 'PI' },
    { value: 'PR', text: 'PR' },
    { value: 'RO', text: 'RO' },
    { value: 'SC', text: 'SC' },
    { value: 'SP', text: 'SP' },
  ]

  const handleChangeEstado = async (uf) => {
    setEstadoSelecionado(uf)
    setCidadeSelecionada('')
    setLojas([])
    setCidades([])

    if (!uf) return

    try {
      setLoading(true)
      const response = await api.get(
        `dataentities/SL/search?_where=state=${uf}&_fields=id,store,name,phone,address,number,complement,neighborhood,postalCode,city,state,latitude,longitude,email,openingHours,whatsapp`,
        { headers: { 'rest-range': 'resources=0-100' } }
      )

      const lojasDoEstado = response.data || []
      const cidadesUnicas = [
        ...new Set(lojasDoEstado.map((item) => item.city).filter(Boolean)),
      ]

      setCidades(cidadesUnicas)
      setLojas(lojasDoEstado)
    } catch (err) {
      console.error('Erro ao buscar lojas:', err)
    } finally {
      setLoading(false)
      setDropdownAberto(null)
    }
  }

  const handleChangeCidade = (cidade) => {
    setCidadeSelecionada(cidade)
    setDropdownAberto(null)
  }

  const lojasFiltradas = cidadeSelecionada
    ? lojas.filter((loja) => loja.city === cidadeSelecionada)
    : []

    console.log('panda lojas', lojasFiltradas)

  const toggleDropdown = (tipo) => {
    setDropdownAberto(dropdownAberto === tipo ? null : tipo)
  }

  useEffect(() => {
    handleChangeEstado('SP')
    setTimeout(() => {
      handleChangeCidade('São Paulo')
    }, 1000)
  }, [])

  return (
    <div className={styles.coreLojas}>
      <div className={styles.coreLojasSelects}>

        {/* SELECT CUSTOM DE ESTADO */}
        <div className={styles.coreLojasSelectItem}>
          <label htmlFor='estado'>seu estado</label>
          <div
            className={styles.coreLojaSelectTrigger}
            onClick={() => toggleDropdown('estado')}
          >
            {estadoSelecionado
              ? estados.find((e) => e.value === estadoSelecionado)?.text
              : (
                <span className={styles.coreLojaSelectPlaceholder}>selecione o estado</span>
              )}

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="#121416" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          {dropdownAberto === 'estado' && (
            <div className={styles.coreLojaSelectOptions}>
              {estados.map((option) => (
                <div
                  key={option.value}
                  className={styles.coreLojaSelectOption}
                  onClick={() => handleChangeEstado(option.value)}
                >
                  {option.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SELECT CUSTOM DE CIDADE */}
        <div className={styles.coreLojasSelectItem}>
          <label>sua cidade</label>

          <div
            className={`${styles.coreLojaSelectTrigger} ${
              !estadoSelecionado || cidades.length === 0 || loading
                ? styles.disabled
                : ''
            }`}
            onClick={() =>
              !loading &&
              estadoSelecionado &&
              cidades.length > 0 &&
              toggleDropdown('cidade')
            }
          >
            {loading
              ? 'Carregando cidades...'
              : cidades.length === 0
              ? 'Nenhuma cidade disponível'
              : cidadeSelecionada || 'Selecione a cidade'}

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="#121416" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          {dropdownAberto === 'cidade' &&
            !loading &&
            cidades.length > 0 && (
              <div className={styles.coreLojaSelectOptions}>
                {cidades.map((cidade) => (
                  <div
                    key={cidade}
                    className={styles.coreLojaSelectOption}
                    onClick={() => handleChangeCidade(cidade)}
                  >
                    {cidade}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* LISTAGEM DE LOJAS */}
      <div>
        {lojasFiltradas.length > 0 && (
          <>
          <div className={styles.coreLojasListHeader}>
            <span className={styles.coreLojasQuantity}>
              {lojasFiltradas.length}
            </span>
            {' '}
            loja
            {lojasFiltradas.length > 1 ? 's' : ''} em
            {' '}
            <strong>
              {estadoSelecionado}, {cidadeSelecionada}
            </strong>
          </div>
          <div className={styles.coreLojasCards}>
            {lojasFiltradas.map((item) => (
              <div key={item.id} className={styles.cardLojas}>
                <h4>{item.name}</h4>
                <div className={styles.coreLojaCardInfo}>
                  <div className={styles.coreLojasCardInfoItem}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.0002 11.6668C11.381 11.6668 12.5003 10.5475 12.5003 9.16677C12.5003 7.78605 11.381 6.66675 10.0002 6.66675C8.6195 6.66675 7.5002 7.78605 7.5002 9.16677C7.5002 10.5475 8.6195 11.6668 10.0002 11.6668Z" stroke="#171A1C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14.7144 13.8809L11.1786 17.4168C10.8661 17.729 10.4424 17.9044 10.0006 17.9044C9.55891 17.9044 9.13523 17.729 8.82272 17.4168L5.28602 13.8809C4.35369 12.9486 3.71878 11.7607 3.46157 10.4675C3.20436 9.17425 3.33641 7.83381 3.84101 6.61565C4.34561 5.39748 5.2001 4.3563 6.29643 3.62377C7.39276 2.89123 8.68169 2.50024 10.0002 2.50024C11.3188 2.50024 12.6077 2.89123 13.704 3.62377C14.8004 4.3563 15.6549 5.39748 16.1595 6.61565C16.6641 7.83381 16.7961 9.17425 16.5389 10.4675C16.2817 11.7607 15.6468 12.9486 14.7144 13.8809Z" stroke="#171A1C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>
                      {item.address} {item.number} - {item.complement} -{' '}
                      {item.neighborhood}
                    </p>
                  </div>
                  {item.openingHours && (
                    <div className={styles.coreLojasCardInfoItem}>
                      <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.6002 0.599976V3.93334M3.93346 0.599976V3.93334M0.600098 7.26671H13.9336M5.60015 11.4334H8.93351M2.26678 2.26666H12.2669C13.1874 2.26666 13.9336 3.01286 13.9336 3.93334V13.9334C13.9336 14.8539 13.1874 15.6001 12.2669 15.6001H2.26678C1.3463 15.6001 0.600098 14.8539 0.600098 13.9334V3.93334C0.600098 3.01286 1.3463 2.26666 2.26678 2.26666Z" stroke="#171A1C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <p>
                        {item.openingHours}
                      </p>
                    </div>
                  )}
                  <div className={styles.coreLojasCardInfoItem}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.16668 3.33337H7.50005L9.16673 7.50008L7.08338 8.75009C7.97585 10.5597 9.44046 12.0243 11.2501 12.9168L12.5001 10.8334L16.6668 12.5001V15.8335C16.6668 16.2755 16.4912 16.6995 16.1786 17.012C15.8661 17.3246 15.4422 17.5002 15.0001 17.5002C11.7495 17.3026 8.68352 15.9222 6.38073 13.6195C4.07794 11.3167 2.69754 8.2507 2.5 5.00006C2.5 4.55803 2.6756 4.1341 2.98816 3.82153C3.30072 3.50897 3.72465 3.33337 4.16668 3.33337Z" stroke="#171A1C" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>
                      {item.phone}
                    </p>
                  </div>
                </div>
                {item.whatsapp && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${item.whatsapp.replace(/[^a-zA-Z0-9]/g, '')}`}
                    className={styles.coreLojasCardButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.66764 10.4482C9.66764 10.5514 9.70861 10.6503 9.78154 10.7232C9.85447 10.7962 9.95339 10.8371 10.0565 10.8371C10.1597 10.8371 10.2586 10.7962 10.3315 10.7232C10.4044 10.6503 10.4454 10.5514 10.4454 10.4482V9.67046C10.4454 9.56732 10.4044 9.46841 10.3315 9.39548C10.2586 9.32254 10.1597 9.28157 10.0565 9.28157C9.95339 9.28157 9.85447 9.32254 9.78154 9.39548C9.70861 9.46841 9.66764 9.56732 9.66764 9.67046V10.4482ZM9.66764 10.4482C9.66764 11.4796 10.0774 12.4688 10.8067 13.1981C11.536 13.9274 12.5251 14.3371 13.5565 14.3371M13.5565 14.3371H14.3343C14.4374 14.3371 14.5364 14.2962 14.6093 14.2232C14.6822 14.1503 14.7232 14.0514 14.7232 13.9482C14.7232 13.8451 14.6822 13.7462 14.6093 13.6733C14.5364 13.6003 14.4374 13.5593 14.3343 13.5593H13.5565C13.4534 13.5593 13.3545 13.6003 13.2815 13.6733C13.2086 13.7462 13.1676 13.8451 13.1676 13.9482C13.1676 14.0514 13.2086 14.1503 13.2815 14.2232C13.3545 14.2962 13.4534 14.3371 13.5565 14.3371ZM5.00098 19.004L6.28431 16.0484C5.30249 14.6547 4.86305 12.9505 5.04846 11.2558C5.23386 9.5611 6.03136 7.99229 7.2913 6.84381C8.55124 5.69533 10.187 5.04613 11.8916 5.01804C13.5962 4.98995 15.2525 5.58491 16.5496 6.69125C17.8467 7.7976 18.6954 9.33928 18.9366 11.027C19.1777 12.7147 18.7946 14.4323 17.8593 15.8577C16.9239 17.283 15.5005 18.318 13.8563 18.7684C12.212 19.2188 10.4599 19.0536 8.92875 18.304L5.00098 19.004Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    entre em contato
                  </a>
                )}
              </div>
            ))}
          </div>
          </>
        )}

        {cidadeSelecionada && lojasFiltradas.length === 0 && (
          <p>Nenhuma loja encontrada nessa cidade.</p>
        )}
      </div>
    </div>
  )
}