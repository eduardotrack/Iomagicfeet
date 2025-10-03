import React, { useEffect } from 'react'
import { waitForElement } from './utils/waitForElement'

export default function OrderPlacedSmarthint() {
  const fetchOrderData = async (orderId) => {
    const response = await fetch(`/api/oms/pvt/orders/${orderId}`)
    const orderData = await response.json()
    organizeOrderData(orderData)
  }

  const organizeOrderData = async (orderData) => {
    function transformItems(items) {
      return {
        "Items": items.map(item => ({
          "Name": item.name,
          "ProductId": item.productId,
          "Quantity": item.quantity,
          "SKU": item.id
        }))
      }
    }

    const totalShipping = orderData.totals.find(total => total.id === 'Shipping')?.value || 0
    const sessionId = await getSessionId()

    const organizedData = {
      "Date": new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date()).replace(',', ''), //DateTime|Campo obrigatório - Data que o pedido foi finalizado/criado. A informação deverá ser enviada no seguinte formato "DD/MM/AAAA HH:MM:SS"
      "Freight": totalShipping / 100, //Double|Campo obrigatório - Valor cobrado para o frete do Pedido
      "OrderId": orderData.orderId, //Integer|Campo obrigatório - Código/Número do Pedido criado
      "Total": orderData.value / 100, //Double|Campo obrigatório - Valor total do Pedido criado
      "anonymousConsumer": orderData.clientProfileData.userProfileId, //String|Campo obrigatório - Identificador do Comprador que realizou a compra. É muito importante que este valor enviado seja o mesmo utilizado em toda a jornada do Comprador pelo Site/App.
      "session": sessionId, //String|Campo obrigatório - Valor da Sessão do Comprador que realizou a compra. É muito importante que este valor enviado seja o mesmo utilizado em toda a jornada do Comprador pelo Site/App.
      "Items": transformItems(orderData.items).Items //Array[Item]|Campo obrigatório - Lista de Produtos comprados no Pedido
    }

    sendDataToSmarthint(organizedData)
  }

  const getSessionId = async () => {
    const response = await fetch('/api/sessions?items=id')
    const sessionData = await response.json()
    return sessionData.id
  }

  const sendDataToSmarthint = (data) => {
    fetch('https://recs.smarthint.co/track/order?shcode=SH-393768', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      console.log('Dados enviados para Smarthint com sucesso:', response)
    })
    .catch(error => {
      console.error('Erro ao enviar dados para Smarthint:', error)
    })
  }

  useEffect(() => {
    const isOrderPlaced = window.location.href.includes('/orderPlaced')

    if (isOrderPlaced) {
      async function getData() {
        const orderNumber = await waitForElement('.vtex-order-placed-2-x-orderNumber')
        const orderId = orderNumber?.textContent.split('#')[1]

        fetchOrderData(orderId)
      }


      getData()
    }
  }, [])
  return <></>
}