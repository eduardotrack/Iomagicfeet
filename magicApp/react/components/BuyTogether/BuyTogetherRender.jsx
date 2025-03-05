import BuyTogether from ".";
import { ToastProvider } from "../ToastNotification/ToastContext";
import React, { useState, useEffect } from "react";
import { useProduct } from "vtex.product-context";
import style from './styles.css'


export default function BuyTogetherRender(appCore) {
  const [selectAll, setSelectAll] = useState(false);
  const [isPDPMatched, setIsPDPMatched] = useState(false);

  if (appCore.buyTogetherItems?.length < 1) return null;

  const productContext = useProduct() || null

  const checkValidation = () => {
    if (!productContext || !productContext.product) return;

    const categoryTree = productContext.product.categoryTree || [];
    const productCategoriesId = categoryTree.map((category) => String(category.id));
    const productClusters = productContext.product.productClusters || [];
    const productClustersId = productClusters.map((cluster) => String(cluster.id));
    const productId = productContext.product.productId || null;

    const matchingItem = appCore.buyTogetherItems?.find((item) => {
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

    console.log("AQUI", appCore.buyTogetherItems)

    if (matchingItem) {
      setIsPDPMatched(true);
    } else {
      setIsPDPMatched(false);
    }
  };

  // check if there are multiple products to be added - checkbox
  const totalProducts = appCore.buyTogetherItems.reduce((total, item) =>
    total + (item.extraProducts?.length || 0), 0
  );
  const hasMultipleProducts = totalProducts > 1;

  const handleSelectAll = async () => {
    const newValue = !selectAll;
    setSelectAll(newValue);

    if (newValue) {
      const products = appCore.buyTogetherItems.flatMap(item =>
        item.extraProducts?.map(product => ({ item, product })) || []
      );

      for (let i = 0; i < products.length; i++) {
        const { item, product } = products[i];

        await new Promise(resolve => setTimeout(resolve, 700));

        document.dispatchEvent(new CustomEvent("addToCart", { detail: { item, product } }));
      }
    }
  };

  useEffect(() => {
    checkValidation();
  }, [appCore, productContext])

  if (!isPDPMatched) return null;

  return (
    <ToastProvider>
      <div className={style.buyTogetherMain}>
        <div className={style.buyTogetherMainTop}>
          <p className={style.buyTogetherTitle}>
            Selecionados para você
          </p>
          {hasMultipleProducts && (
            <div className={style.selectAllContainer}>
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <label htmlFor="select-all" className={style.selectAllLabel}>
                {selectAll ? 'adicionado ao carrinho!' : 'adicionar todos ao carrinho!'}
              </label>
            </div>
          )}
        </div>
        <div className={style.buyTogetherCardsContainer}>
        {appCore.buyTogetherItems.map((item) => (
          item.extraProducts?.map((product, index) => (
            <BuyTogether
              key={`${item.validatorId}-${product.slug}-${index}`}
              buyTogetherItems={[{
                ...item,
                slug: product.slug
              }]}
              selectAll={selectAll}
            />
          ))
        ))}
        </div>
      </div>
    </ToastProvider>
  )
};

BuyTogetherRender.schema = {
  title: "Panda | Compre Junto - SKU",
  description: "Adicione um SKU para exibir um produto adicional na página",
  type: "object",
  properties: {
    buyTogetherItems: {
      title: "Adicione itens",
      type: "array",
      items: {
        title: "Item",
        description: "Adicione um SKU para exibir um produto adicional na página",
        type: "object",
        properties: {
          __editorItemTitle: {
            default: 'Item',
            title: 'Escolha o nome do item',
            type: 'string'
         },
          validatorId: {
            title: 'ID de Validação - Onde será exibido',
            description: 'ID de produto, categoria ou coleção (conforme item selecionado) de onde o produto ficará visível. Para adicionar mais de um ID separe por vírgulas, ex.: "123456,65789"',
            type: 'string',
            default: null
          },
          validator: {
            title: "Tipo do ID para filtragem",
            description: "Escolha uma das opções para filtrar de acordo com o ID de validação em quais PDPs o card aparecerá",
            type: "string",
            enum: [
              'category',
              'product',
              'collection'
            ],
            enumNames: [
              'Categoria',
              'Produto',
              'Coleção'
            ],
            default: 'category',
            widget: {
              "ui:widget": "radio"
            }
          },
          extraProducts: {
            title: "Produtos adicionais",
            description: "Adicione produtos adicionais para exibir na página",
            type: "array",
            items: {
              title: "Produto Adicional",
              type: "object",
              properties: {
                slug: {
                  title: 'Slug do Produto extra',
                  description: 'Parte da URL do produto que identifica ele no site. Ex.: "meia-puma-infantil-17000-2-994"',
                  type: 'string',
                  default: null
                }
              }
            }
          }
        }
      }
    }
  }
}
