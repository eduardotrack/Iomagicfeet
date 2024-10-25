import React, { useState } from "react";
import styles from "./styles.css";

const categoriesExample = [
  {
    name: 'Camisetas',
    image: 'https://magicfeet.vtexassets.com/assets/vtex/assets-builder/magicfeet.magictheme/4.0.24/img/black-friday/camisetas-prebf___091f73fdb44aeeb4c9e95b552a7fcdbb.png',
    link: '/camisetas'
  },
  {
    name: 'Jaquetas',
    image: 'https://magicfeet.vtexassets.com/assets/vtex/assets-builder/magicfeet.magictheme/4.0.24/img/black-friday/jaquetas-prebf___29cc5556d42225af38b6b3a4ab062077.jpg',
    link: '/jaquetas'
  },
  {
    name: 'Tênis',
    image: 'https://magicfeet.vtexassets.com/assets/vtex/assets-builder/magicfeet.magictheme/4.0.24/img/black-friday/tenis-prebf___e28082eebd022d1a9a8871328d4fc314.jpg',
    link: '/tenis'
  },
  {
    name: 'Jeans',
    image: 'https://magicfeet.vtexassets.com/assets/vtex/assets-builder/magicfeet.magictheme/4.0.24/img/black-friday/jeans-prebf___7ae4523715fd11036251d0c28dd764e4.png',
    link: '/jeans'
  },
];

function CategoryTabsBlackFriday(categoryTabsBlackFriday) {
  const [openTab, setOpenTab] = useState(3);
  const categories = categoryTabsBlackFriday.categories || categoriesExample;


  function handleClickOnTab(tabId, categoryLink) {
    if (tabId === openTab) {
      location.href = categoryLink;
      return
    }

    setOpenTab(tabId);
  }

  return (
    <div className={styles.tabsContainer}>
      {categories.map((category, index) => (
        <div key={index} className={openTab === (index + 1) ? `${styles.tabBf} ${styles.tabBfSpacing}` : `${styles.tabBf}` }>
          <button
            className={openTab === index ? styles.tabOpened : styles.tabClosed}
            onClick={() => handleClickOnTab(index, category.link)}
          >
            <img src={category.image} alt={category.name} className={styles.imgTab} />
            <div className={styles.tabTitle}>
              <p>{category.name}</p>
              <div className={styles.tabArrow}>
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8.70825L10 12.7083L14 8.70825" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}


CategoryTabsBlackFriday.schema = {
  title: "Panda | Cards de Categoria Mobile",
  description: "Adicione os cards de categoria para a Black Friday na versão mobile.",
  type: "object",
  properties: {
    categories: {
      title: 'Categorias',
      description: "Você pode mudar a ordem dos cards movimentando os itens.",
      type: 'array',
      minItems: 0,
      items: {
        title: 'Categoria',
        type: 'object',
        properties: {
          name: {
            title: "Nome da categoria",
            description: "Adicione o nome que ficará como título do card.",
            type: "string",
            default: null
          },
          image: {
            title: "Imagem",
            description: "Adicione o link da imagem que será usada no card.",
            type: "string",
            default: null
          },
          link: {
            title: "Url da categoria",
            description: "Url para qual o usuário será redirecionado quando clicar no card. Ex.: '/tenis'.",
            type: "string",
            default: null
          },
        }
      }
    }
  }
}

export default CategoryTabsBlackFriday;
