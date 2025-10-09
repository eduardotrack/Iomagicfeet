import React, { useEffect, useState } from 'react'
import { waitForElement } from './utils/waitForElement'

export default function OrderPlacedSmarthint() {
  const [orderId, setOrderId] = useState(null)

  useEffect(() => {
    const isOrderPlaced = window.location.href.includes('/orderPlaced')

    if (!isOrderPlaced) return

    async function getOrderIdFromHTML() {
      const orderNumberEl = await waitForElement('.vtex-order-placed-2-x-orderNumber')
      const id = orderNumberEl?.textContent?.split('#')[1]?.trim() || null
      setOrderId(id)
    }

    getOrderIdFromHTML()
  }, [])

  useEffect(() => {
    if (!orderId) return

    async function fetchOrderData(id) {
      try {
        const res = await fetch(`/api/checkout/pub/orders/${id}`)

        if (!res.ok) throw new Error('Erro ao buscar pedido')
        const data = await res.json()
        if (!data || !data.items) return

        const session = await getSession()
        const anonymousConsumer = await getAnonymousConsumer()

        const organizedData = {
          Date: formatDate(new Date()),
          Freight: (data.totals?.find(t => t.id === 'Shipping')?.value || 0) / 100,
          OrderId: data.orderId,
          Total: data.value / 100,
          anonymousConsumer,
          session,
          Items: data.items.map(item => ({
            Name: item.nameComplete || item.name,
            Quantity: item.quantity,
            SKU: item.id,
            ProductId: item.productId
          }))
        }

        sendDataToSmarthint(organizedData)
      } catch (err) {
        console.error('Erro ao buscar dados do pedido:', err)
      }
    }

    fetchOrderData(orderId)
  }, [orderId])

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const getSession = async () => {
    const existingSession = localStorage.getItem('sh-session')
    if (existingSession) return existingSession

    try {
      const res = await fetch('/api/sessions?items=id')
      const data = await res.json()
      const sessionValue = data?.id ? `sh-session-${data.id}` : `sh-session-${crypto.randomUUID()}`
      localStorage.setItem('sh-session', sessionValue)
      return sessionValue
    } catch {
      const fallback = `sh-session-${crypto.randomUUID()}`
      localStorage.setItem('sh-session', fallback)
      return fallback
    }
  }

  const getAnonymousConsumer = async () => {
    const existingAnon = localStorage.getItem('anonymousCode')
    if (existingAnon) return existingAnon

    try {
      const res = await fetch('/no-cache/profileSystem/getProfile')
      const profile = await res.json()
      const anonCode = profile?.IsUserDefined && profile?.UserId
        ? `sh-user-${profile.UserId}`
        : `sh-user-${crypto.randomUUID()}`
      localStorage.setItem('anonymousCode', anonCode)
      return anonCode
    } catch {
      const fallback = `sh-user-${crypto.randomUUID()}`
      localStorage.setItem('anonymousCode', fallback)
      return fallback
    }
  }

  const sendDataToSmarthint = (data) => {
    try {
      const payload = {
        Date: data.Date || '',
        anonymousConsumer: data.anonymousConsumer || '',
        session: data.session || '',
        Total: data.Total || 0,
        OrderId: data.OrderId || '',
        Freight: data.Freight || 0,
        Items: Array.isArray(data.Items) ? data.Items : [],
      }

      fetch('https://service.smarthint.co/track/order?key=SH-393768', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: JSON.stringify(payload),
      })
        .then(res => {
          console.log('Dados enviados para SmartHint com sucesso', res)
        })
        .catch(err => {
          console.error('Erro ao enviar dados para SmartHint:', err)
        })
    } catch (err) {
      console.error('Erro ao montar payload SmartHint:', err)
    }
  }

  return null
}
