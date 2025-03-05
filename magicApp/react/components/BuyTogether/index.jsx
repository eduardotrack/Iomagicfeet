import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useOrderItems } from 'vtex.order-items/OrderItems'
import { useToast } from '../ToastNotification/ToastContext'
import { useProduct } from "vtex.product-context"
import Select from "react-dropdown-select";

import style from './styles.css'

function BuyTogether({ buyTogetherItems, selectAll }) {
  const [productInfo, setProductInfo] = useState(null)
  const [productPrice, setProductPrice] = useState(null)
  const [isChecked, setIsChecked] = useState(false)
  const [isPDPMatched, setIsPDPMatched] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)

  const { addItems } = useOrderItems()
  const { showToast } = useToast()
  const productContext = useProduct() || null

  const getSKUInfo = async () => {
    try {
      const { data } = await axios.get(`/api/catalog_system/pub/products/search/${currentItem.slug}/p`)
      setProductInfo(data[0])
      console.log("FIRST", data[0])

      // Define o primeiro SKU como padrão
      if (data[0]?.items?.length > 0) {
        const firstAvailableSku = data[0].items.find(item => item.sellers[0].commertialOffer.AvailableQuantity > 0)
        setSelectedSize(firstAvailableSku.itemId)
        setProductPrice(firstAvailableSku.sellers[0].commertialOffer.Price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
      }
    } catch (error) {
      console.error('Erro ao buscar SKU do produto adicional', error)
    }
  }

  const handleAddItem = async () => {
    if (!selectedSize) return

    await addItems([{
      id: selectedSize,
      quantity: 1,
      seller: '1'
    }])

    if (selectAll) {
      new Promise((resolve) => setTimeout(resolve, 2000))
    }

    showToast(`${productInfo.productName} foi adicionado ao carrinho.`, 'success')
  }

  const checkValidation = () => {
    if (!productContext || !productContext.product) return;

    const categoryTree = productContext.product.categoryTree || [];
    const productCategoriesId = categoryTree.map((category) => String(category.id));
    const productClusters = productContext.product.productClusters || [];
    const productClustersId = productClusters.map((cluster) => String(cluster.id));
    const productId = productContext.product.productId || null;

    const matchingItem = buyTogetherItems?.find((item) => {
      const ids = item.validatorId?.split(",").map((id) => id.trim());
      if (ids && item.validator === "category") {
        return productCategoriesId.some((category) => ids.includes(category));
      }
      if (item.validator === "product") {
        return ids.includes(productId);
      }
      if (item.validator === "collection") {
        return productClustersId.some((cluster) => ids.includes(cluster));
      }
      return false;
    });

    if (matchingItem) {
      setIsPDPMatched(true);
      setCurrentItem(matchingItem);
    } else {
      setIsPDPMatched(false);
      setCurrentItem(null);
    }
  };

  useEffect(() => {
    checkValidation();
  }, [productContext]);

  useEffect(() => {
    if (currentItem) {
      getSKUInfo();
    } else {
      console.log("Nenhum match para card compre junto.");
    }

    const handleAddToCartEvent = async (event) => {
      if (event.detail.product.slug === currentItem?.slug) {
        setIsChecked(true);
      }
    };

    document.addEventListener("addToCart", handleAddToCartEvent);

    return () => {
      document.removeEventListener("addToCart", handleAddToCartEvent);
    };
  }, [currentItem]);

  useEffect(() => {
    if (isChecked) {
      handleAddItem()
    }
  }, [isChecked])

  useEffect(() => {
    if (selectAll === false) {
      setIsChecked(selectAll);
    }
  }, [selectAll]);

  if (!productInfo || !isPDPMatched) {
    return <></>
  }

  return (
    <div className={style.buyTogetherContainer}>
      <div className={style.buyTogetherProduct}>
        <img className={style.buyTogetherImg} src={productInfo.items[0]?.images[0]?.imageUrl} />
        <div className={style.buyTogetherProductInfo}>
          <div className={style.buyTogetherText}>
            <p className={style.buyTogetherBrand}>{productInfo.brand}</p>
            <p className={style.buyTogetherName}>{productInfo.productName}</p>
            <p className={style.buyTogetherReference}>Referência: {productInfo.productReferenceCode}</p>
            <p className={style.buyTogetherPrice}>{productPrice}</p>
          </div>
          <div className={style.buyTogetherAction}>
            {productInfo.items.length > 1 && (
              <Select
                options={productInfo.items.map((item) => {
                  if (item.sellers[0].commertialOffer.AvailableQuantity < 1) return null
                  return ({
                    value: item.itemId,
                    label: item.name?.split(' - ')[1]
                  })
                })}
                onChange={(values) => {
                  const selectedSku = productInfo.items.find(item => item.itemId === values[0].value)
                  setSelectedSize(values[0].value)
                  setProductPrice(selectedSku.sellers[0].commertialOffer.Price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                  setIsChecked(false)
                }}
                values={[{ value: selectedSize, label: productInfo.items.find(item => item.itemId === selectedSize)?.name.split(' - ')[1] }]}
                className={style.buyTogetherSelect}
                searchable={false}
              />
            )}
            {/* {productInfo.items.length > 1 && (
              <select
                className={style.buyTogetherSelect}
                value={selectedSize}
                onChange={(e) => {
                  const selectedSku = productInfo.items.find(item => item.itemId === e.target.value)
                  setSelectedSize(e.target.value)
                  setProductPrice(selectedSku.sellers[0].commertialOffer.Price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                  setIsChecked(false)
                }}
              >
                {productInfo.items.map((item) => {
                  if (item.sellers[0].commertialOffer.AvailableQuantity < 1) return null
                  return (
                    <option key={item.itemId} value={item.itemId}>
                      {item.name.split(' - ')[1]}
                    </option>
                  )
                })}
              </select>
            )} */}
            <input type="checkbox" id={`add-extra-${productInfo.productName}`} className={style.individualInput} checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
            <label htmlFor={`add-extra-${productInfo.productName}`} className={style.buyTogetherLabel}></label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyTogether;
