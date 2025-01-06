import React, { useState } from 'react'
import axios from 'axios'

import api from './services/api'
import styles from './styles.css'

const nossasLojas = () => {
  const [formData, updateFormData] = useState()
  const [selected, setSelected] = useState('')

  const options = [
    { value: '', text: 'Selecione o estado desejado' },
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

  const handleChange = async (event) => {
    const selectedValue = event.target.value

    setSelected(selectedValue) // Atualiza o valor selecionado imediatamente.

    try {
      const response = await api.get(
        `dataentities/SL/search?_where=state=${selectedValue}&_fields=id,store,name,phone,address,number,complement,neighborhood,postalCode,city,state,latitude,longitude,email`,
        {
          headers: {
            'rest-range': 'resources=0-100',
          },
        }
      )

      updateFormData(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className={styles.coreLojas}>
        <div>
          <select
            className={styles.selectLojas}
            onChange={handleChange}
            value={selected}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>

        <div>
          {formData &&
            formData.map((item) => {
              return (
                <>
                  <div className={styles.cardLojas}>
                    <h4>{item.name}</h4>
                    <p>
                      {item.address} {item.number} - {item.complement} -{' '}
                      {item.neighborhood}
                    </p>
                    <h5>
                      {item.city}/{item.state}
                    </h5>
                    <h6>{item.phone}</h6>
                  </div>
                </>
              )
            })}
        </div>
      </div>
    </>
  )
}

export default nossasLojas
