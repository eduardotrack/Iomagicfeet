import React, {useEffect} from "react";
import style from "./styleFaq.css"

function categoriaFaq(faqCore) {
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

    return (
        <>
          {faqCore.showFaq && (
             <div className={`${style.faq}`}>
             <div className={`${style.seo_header}`}><h2><b>Dúvidas</b> Frequentes</h2></div>

             <div className={`${style.conteiner_faq}`} itemscope='itemscope' itemtype="https://schema.org/FAQPage">
                {
                    faqCore.departments && faqCore.departments.map((item, index) => {
                        return(
                          <>
                           <div className={`${style.tabs}`} itemscope="" itemprop="mainEntity" itemtype="https://schema.org/Question">
                              <div className={`${style.tab}`}>
                                  <input type="radio" id={`rd${index + 1}`} name="rd" />
                                  <label className={`${style.tab_label}`} for={`rd${index + 1}`} itemprop="name">{index + 1}. {item.pergunta} <span className={`${style.control_close}`}></span></label>
                                  <div className={`${style.tab_content}`} itemscope="" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                                      <p itemprop="text"  dangerouslySetInnerHTML={{ __html: item.resposta }} />
                                  </div>
                              </div>
                            </div>
                          </>
                        )
                    })
                  }

                  <div className={`${style.tab}`}>
                      <input type="radio" id="rd30" name="rd" />
                      <label for="rd30" className={`${style.tab_close}`}>Fechar todos</label>
                  </div>

             </div>
           </div>
          )}
        </>
    );
}

categoriaFaq.schema = {
  title: "FAQ da Página",
  description: "Adicione as perguntas frequentes que serão exibidas na página.",
  type: "object",
  properties: {
    showFaq: {
      title: 'Ativar FAQ',
      type: 'boolean',
      default: false,
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

export default categoriaFaq;
