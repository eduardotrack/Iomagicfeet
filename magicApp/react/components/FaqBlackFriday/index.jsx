import React, {useEffect, useState} from "react";
import style from "./styles.css"

function FaqBlackFriday(faqCore) {
  const [blackFriday, setBlackFriday] = useState();
  const [evento, setEvento] = useState();

    useEffect(() => {
      const appPrefix = "magicfeet-magicapp-0-x-"

      const tabLabel = document.querySelectorAll(`.${appPrefix}tab_label`)

      tabLabel.forEach(item => {
        item.addEventListener('click', e => {
          e.preventDefault();

          var forName = item.getAttribute('for')
          const checkInput = document.querySelector(`.${appPrefix}conteiner_faq .${appPrefix}tabs #${forName}`).checked || null

          if(checkInput){
            const tabs = document.querySelectorAll(`.${appPrefix}conteiner_faq .${appPrefix}tabs input`);

            tabs.forEach(item => {
              item.checked = false;
            })
          }else{
            document.querySelector(`.${appPrefix}conteiner_faq .${appPrefix}tabs #${forName}`).checked = true;
          }
        });
      })
    }, []);

    function ControlPageBlackFriday() {

      const elementPageBlack = document.querySelector('.vtex-flex-layout-0-x-flexRow--search-generica-black')

      if(elementPageBlack) {
          setBlackFriday(true)

          const appPrefix = "magicfeet-magicapp-0-x-"

          const tabLabel = document.querySelectorAll(`.${appPrefix}tab_label`)

          tabLabel.forEach(item => {
            item.addEventListener('click', e => {
              e.preventDefault();

              var forName = item.getAttribute('for')
              const checkInput = document.querySelector(`.${appPrefix}conteiner_faqBlackFriday .${appPrefix}tabs #${forName}`).checked || null

              if(checkInput){
                const tabs = document.querySelectorAll(`.${appPrefix}conteiner_faqBlackFriday .${appPrefix}tabs input`);

                tabs.forEach(item => {
                  item.checked = false;
                })
              }else{
                document.querySelector(`.${appPrefix}conteiner_faqBlackFriday .${appPrefix}tabs #${forName}`).checked = true;
              }
            });
          })
      } else {
          setBlackFriday(false)
      }
  };

  function ControlPageEventos() {
    const elementPageEvento = document.querySelector('.vtex-flex-layout-0-x-flexRow--search-generica-eventos')

    if(elementPageEvento) {
        setEvento(true)

        const appPrefix = "magicfeet-magicapp-0-x-"

        const tabLabel = document.querySelectorAll(`.${appPrefix}tab_label`)

        tabLabel.forEach(item => {
          item.addEventListener('click', e => {
            e.preventDefault();

            var forName = item.getAttribute('for')
            const checkInput = document.querySelector(`.${appPrefix}conteiner_faqEventoFriday .${appPrefix}tabs #${forName}`).checked || null

            if(checkInput){
              const tabs = document.querySelectorAll(`.${appPrefix}conteiner_faqEventoFriday .${appPrefix}tabs input`);

              tabs.forEach(item => {
                item.checked = false;
              })
            }else{
              document.querySelector(`.${appPrefix}conteiner_faqEventoFriday .${appPrefix}tabs #${forName}`).checked = true;
            }
          });
        })
    } else {
        setEvento(false)
    }
};

  useEffect(() => {
    setTimeout(() => {
        ControlPageBlackFriday()
        ControlPageEventos()
    }, 1000)
  }, [])

    return (
        <>
          {faqCore.showFaq && (
             <div className={`${style.faq}`}>
             <div className={`${evento ? `${style.conteiner_faq} ${style.conteiner_faqEvento}` : blackFriday ? style.conteiner_faqBlackFriday : style.conteiner_faq}`} itemscope='itemscope' itemtype="https://schema.org/FAQPage">
                {
                    faqCore.departments && faqCore.departments.map((item, index) => {
                        return(
                          <>
                           <div className={`${style.tabsFaq}`} itemscope="" itemprop="mainEntity" itemtype="https://schema.org/Question">
                              <div className={`${style.tabFaq}`}>
                                  <input type="radio" id={`rd${index + 1}`} name="rd" />
                                  <label className={`${style.tab_labelFaq}`} for={`rd${index + 1}`} itemprop="name">
                                    <h3>{index + 1}. {item.pergunta}</h3>
                                    <span className={`${style.control_close}`}>
                                    </span>
                                  </label>
                                  <div className={`${style.tab_contentFaq}`} itemscope="" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                                      <p itemprop="text"  dangerouslySetInnerHTML={{ __html: item.resposta }} />
                                  </div>
                              </div>
                            </div>
                          </>
                        )
                    })
                  }
             </div>
           </div>
          )}
        </>
    );
}

FaqBlackFriday.schema = {
  title: "FAQ da Página",
  description: "Adicione as perguntas frequentes que serão exibidas na página.",
  type: "object",
  properties: {
    showFaq: {
      title: 'Ativar FAQ',
      type: 'boolean',
      default: true,
    },
    departments:{
      title: 'Questões adicionadas ao FAQ',
      description: "Você pode mudar a ordem dos menus movimentando os itens.",
      type: 'array',
      minItems: 0,
      items: {
        title: 'Pergunta e Resposta',
        type: 'object',
        properties: {
          pergunta: {
            title: "Pergunta",
            description: "Adicione a pergunta para o FAQ.",
            type: "string",
            default: null
          },
          resposta: {
            title: "Resposta",
            description: "Adicione a resposta para o FAQ.",
            type: "string",
            widget: {
              "ui:widget": "textarea"
            },
            default: null
          }
        }
      }
    }
  }
}

export default FaqBlackFriday;
