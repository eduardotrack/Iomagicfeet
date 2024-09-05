import React, { useEffect } from "react";
import style from "./familiesMenu.css"


function familiesMenu(familiesMenu) {
  const [familyOpenIndex, setFamilyOpenIndex] = React.useState(0);

  function handleFamilyToggle(index) {
    if (familyOpenIndex === index) {
      setFamilyOpenIndex(null);
    } else {
      setFamilyOpenIndex(index);
    }
  }

  return (
    <div className={`${style.families}`}>
      <div className={`${style.families_title}`}>
        <p>famílias</p>
      </div>

      <div className={`${style.container_families}`}>
        {
          familiesMenu.departments && familiesMenu.departments.map((item, index) => {
              return(
                <div className={`${style.tab}`} key={index}>
                  <div className={`${style.tab_title}`} onClick={() => handleFamilyToggle(index)}>
                    <div>
                      <div className={`${style.tab_img}`}>
                        <img src={item.logoImg} />
                      </div>
                      <p className={`${style.tab__titleText}`}>{item.brand}</p>
                    </div>
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 11L6 6L1 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div className={familyOpenIndex === index ? `${style.tab_content}` : `${style.hidden} ${style.tab_content}`}>
                    {
                      item.children && item.children.map((child, index) => {
                        return(
                          <a href={child.childrenLink} key={index}>{child.childrenName}</a>
                        )
                      })
                    }
                  </div>
                </div>
              )
          })
        }
      </div>

      <a href={`${familiesMenu.seeAll}`} className={`${style.see_all}`}>
        ver <b>todas as famílias</b>
      </a>
    </div>
  );
}

familiesMenu.schema = {
  title: "Panda | Menu > Famílias",
  description: "Adicione as tabs de marcas e suas respectivas famílias.",
  type: "object",
  properties: {
    departments: {
      title: 'Famílias',
      description: "Você pode mudar a ordem dos menus movimentando os itens.",
      type: 'array',
      minItems: 0,
      items: {
        title: 'Marca (pai) e itens (filhos)',
        type: 'object',
        properties: {
          brand: {
            title: "Marca",
            description: "Adicione a marca que ficará como título da tab.",
            type: "string",
            default: null
          },
          logoImg: {
            title: "Logo",
            description: "Tamanho: 32 x 32. Salvar a imagem em 'Mídias' e inserir o link aqui.",
            type: "string",
            default: null
          },
          children: {
            title: "Itens (filhos)",
            description: "Adicione os itens da família.",
            type: "array",
            items: {
              title: "Nome do item",
              description: '',
              type: "object",
              properties: {
                childrenName: {
                  title: "Nome",
                  description: "Adicione o nome do item.",
                  type: "string",
                  default: null
                },
                childrenLink: {
                  title: "Link",
                  description: "Adicione o link do item.",
                  type: "string",
                  default: null
                }
              }
            }
          }
        }
      }
    },
    seeAll: {
      title: "Ver todos",
      description: "Adicione o link para a página de todas as famílias.",
      type: "string",
      default: null
    }
  }
}

export default familiesMenu;
