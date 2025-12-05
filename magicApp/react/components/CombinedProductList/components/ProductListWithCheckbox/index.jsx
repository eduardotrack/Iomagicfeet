import React, { useEffect, useState } from "react"
import axios from "axios"
import { useOrderItems } from "vtex.order-items/OrderItems"
import { usePixel } from "vtex.pixel-manager"
import { useToast } from "../../../ToastNotification/ToastContext";
import style from "./styles.css"

export default function ProductListWithCheckbox({ productIds, modalTitle }) {
  const [products, setProducts] = useState([])
  const [checked, setChecked] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedSku, setSelectedSku] = useState({})


  const { addItems } = useOrderItems()
  const { showToast } = useToast()
  const { push } = usePixel()

  const fetchProducts = async () => {
    try {
      const response = await Promise.all(
        productIds.map((id) =>
          axios.get(`/api/catalog_system/pub/products/search/?fq=productId:${id}`)
        )
      )

      const result = response.map((r) => r.data[0]).filter(Boolean)
      setProducts(result)

      const initialChecked = {}
      result.forEach((p) => (initialChecked[p.productId] = true))
      setChecked(initialChecked)


      // estado de sku default: o primeiro sku do produto
      const initialSku = {}
      result.forEach((p) => {
        const firstSku = p.items?.[0]?.itemId

        if (firstSku) {
          initialSku[p.productId] = firstSku
        }
      })
      setSelectedSku(initialSku)

    } catch (err) {
      console.error("Erro ao buscar produtos:", err)
    }
  }

  useEffect(() => {
    if (productIds?.length > 0) fetchProducts()
  }, [productIds])

  const toggle = (productId) => {
    setChecked((prev) => ({ ...prev, [productId]: !prev[productId] }))
  }

  const handleAddToCart = async () => {
    const selectedSkus = []

    products.forEach((product) => {
      if (!checked[product.productId]) return

      const skuId = selectedSku[product.productId]

      const sku = product.items.find(item => item.itemId === skuId)

      if (sku && sku.sellers?.[0]?.sellerId) {
        selectedSkus.push({
          id: sku.itemId,
          quantity: 1,
          seller: sku.sellers[0].sellerId,
        })
      }
    })

    if (selectedSkus.length === 0) return

    setLoading(true)
    await addItems(selectedSkus)
    setLoading(false)

    showToast('Itens adicionados ao carrinho.', 'success')

    const modalCloseButton = document.querySelector('.vtex-modal-layout-0-x-closeButton--home-modal')
    console.log('modalCloseButton', modalCloseButton)
    if (modalCloseButton) {
      modalCloseButton.click()
    }

    push({
      id: 'add-to-cart-button',
      event: 'viewCart',
    })
  }

  const handleSkuChange = (productId, skuId) => {
    setSelectedSku(prev => ({
      ...prev,
      [productId]: skuId
    }))
  }

  // limpa o nome do sku
  const extractSize = (name) => {
    if (!name) return ""
    const parts = name.split(" - ")
    return parts[1] || name
  }


  if (!products.length) return null

  return (
    <div className={style.productWithCheckbox__wrapper}>
      <h3 className={style.productWithCheckbox__title}>{modalTitle}</h3>

      <div className={style.productWithCheckbox__list}>
        {products.map((product, index) => {
          const image = product.items?.[0]?.images?.[0]?.imageUrl

          return (
            <div key={`${product.productId}-${index}`} className={style.productWithCheckbox__card}>
              <div className={style.productWithCheckbox__image}>
                <img src={image} />
              </div>

              <div className={style.productWithCheckbox__info}>
                <p className={style.productWithCheckbox__name}>{product.productName}</p>

                <p className={style.productWithCheckbox__price}>
                  {product.items?.[0]?.sellers?.[0]?.commertialOffer?.Price?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>


              </div>

              <div className={style.productWithCheckbox__actions}>
                {/* checkbox */}
                <label className={style.customCheckboxWrapper}>
                  <input
                    type="checkbox"
                    className={style.nativeCheckbox}
                    checked={checked[product.productId]}
                    onChange={() => toggle(product.productId)}
                  />
                  <span className={style.customCheckbox}></span>
                </label>
                {/* select skus */}
                <div className={style.customSelectWrapper}>
                  <select
                    className={style.nativeSelect}
                    value={selectedSku[product.productId] ?? ""}
                    onChange={(e) => handleSkuChange(product.productId, e.target.value)}
                  >
                    {product.items?.map((sku) => (
                      <option key={sku.itemId} value={sku.itemId}>
                        {extractSize(sku.name || sku.nameComplete || "")}
                      </option>
                    ))}
                  </select>

                  <div className={style.fakeSelect}>
                    <span className={style.fakeSelectText}>
                      {extractSize(
                        product.items.find(i => i.itemId === selectedSku[product.productId])?.name ||
                        ""
                      )}
                    </span>

                    <span className={style.fakeArrow}>
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.75 0.75L5.75005 5.75005L10.7501 0.75" stroke="#262626" stroke-width="1.50001" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={style.productWithCheckbox__buttonWrapper}>
        <button
          className={style.productWithCheckbox__button}
          onClick={handleAddToCart}
          disabled={loading}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L12 4L17 10M21 10L19 18C18.9065 18.5732 18.6552 19.0872 18.2897 19.4527C17.9243 19.8181 17.4679 20.0118 17 20H7C6.53211 20.0118 6.07572 19.8181 5.71028 19.4527C5.34485 19.0872 5.0935 18.5732 5 18L3 10H21ZM14 15C14 16.1046 13.1046 17 12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          {loading ? "adicionando..." : "adicionar ao carrinho"}
        </button>
      </div>
    </div>
  )
}
