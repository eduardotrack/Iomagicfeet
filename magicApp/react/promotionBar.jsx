import React, {useState} from "react";
import style from "./stylePromotionBar.css"
import { SliderLayout } from 'vtex.slider-layout'

import CardPost from "./components/slideItem";
import CardModal from "./components/cardModal";


function promotionBar(elementCore){
    const [openModal, setModal] = useState(false);
    const [infosModal, setModalInfos] = useState({});

    const sliderLayoutConfig = {
        itemsPerPage: {
          desktop: 1,
          tablet: 1,
          phone: 1,
        },
        infinite: true,
        showNavigationArrows: 'never',
        showPaginationDots: 'never',
        usePagination: false,
        autoplay: {
            "timeout": 5000,
            "stopOnHover": true
        }
      }

      const bannerPosts = elementCore.dadosBanner ?? null

      const alterarStatusModal = (value) => {
        setModal(value)
      };

      const alterarListModal = (value) => {
        setModalInfos(value)
      }

      return ( 
        <>  
            {
              bannerPosts && bannerPosts?.length > 1 && (
                <SliderLayout {...sliderLayoutConfig} className={`${style.boxSlickBanner}`}>
                  {bannerPosts?.map((item) => (
                      <CardPost
                        radioMedia = {item.radioMedia}
                        urlImage = {item.urlImage}
                        urlImageMobile = {item.urlImageMobile}
                        linkMedia = {item.linkMedia || null}
                        urlImageModal = {item.urlImageModal || null}
                        urlImageMobileModal = {item.urlImageMobileModal || null}     
                        textAlt={item.textAlt || ''}
                        setModalStatus={alterarStatusModal}
                        setModalList={alterarListModal}
                      />
                  ))}
                </SliderLayout>
              )
            }

{
              bannerPosts && bannerPosts?.length == 1 && (
                bannerPosts?.map((item) => (
                  <CardPost
                  radioMedia = {item.radioMedia}
                  urlImage = {item.urlImage}
                  urlImageMobile = {item.urlImageMobile}
                  linkMedia = {item.linkMedia || null}
                  urlImageModal = {item.urlImageModal || null}
                  urlImageMobileModal = {item.urlImageMobileModal || null}     
                  textAlt={item.textAlt || ''}
                  setModalStatus={alterarStatusModal}
                  setModalList={alterarListModal}
                />
                ))
              )
            }

            {openModal == true && (
                <CardModal
                    dadosModal = {infosModal}
                    setModalStatus={alterarStatusModal}
                />
            )}

        </>
    )
  
}

export default promotionBar


promotionBar.schema = {
    title: 'Panda - Barra de promoções',
    description: "Adicione a lista de imagens.",
    type: "object",
    properties: {
        dadosBanner: {
            title: 'Lista de banners',
            description: "Você pode mudar a ordem dos menus movimentando os itens.",
            type: 'array',
            minItems: 1,
            items: {
              title: 'Dados do post',
              type: 'object',
              properties: {
                // Tipo de mídia
                radioMedia: {
                    title: 'Vai ativar modal?',
                    type: 'string',
                    enum: ['link', 'modal'], 
                    enumNames: ['link', 'modal'], 
                    widget: {
                    "ui:widget": "radio"
                    },
                    default: "link"
                },

                // Url Imagem
                urlImage:{
                  title: "Upload do conteúdo - Imagem",
                  description: "Adicione a imagem",
                  type: "string",
                  default: null,
                  widget: {
                      "ui:widget": "image-uploader"
                  }
                },

                // Url Imagem mobile
                urlImageMobile:{
                    title: "Upload do conteúdo mobile - Imagem",
                    description: "Adicione a imagem mobile",
                    type: "string",
                    default: null,
                    widget: {
                        "ui:widget": "image-uploader"
                    }
                },

                textAlt: {
                  title: "Texto para SEO",
                  description: "Adicione o texto que vai ser indexado no SEO na imagem e sera enviado para o analytics",
                  type: "string",
                  default: null
                }
              },
  
              dependencies: {
                radioMedia:{
                    oneOf:[
                        {
                            properties: {
                                radioMedia: {
                                    enum: ["link"]
                                },

                                // Link
                                linkMedia: {
                                    title: "Link de redirecionamento do conteudo",
                                    description: "Link para redirecionamento do post, caso não tenha deixar em branco.",
                                    type: "string",
                                    default: null
                                }
                            }
                        },
                        {
                            properties: {
                                radioMedia: {
                                    enum: ["modal"]
                                },

                                // Url Imagem
                                urlImageModal:{
                                    title: "Upload do modal - Imagem",
                                    description: "Adicione a imagem",
                                    type: "string",
                                    default: null,
                                    widget: {
                                        "ui:widget": "image-uploader"
                                    }
                                },
                
                                // Url Imagem mobile
                                urlImageMobileModal:{
                                    title: "Upload do modal mobile - Imagem",
                                    description: "Adicione a imagem mobile",
                                    type: "string",
                                    default: null,
                                    widget: {
                                        "ui:widget": "image-uploader"
                                    }
                                },
                            }
                        }

                    ]
                }
              }
            },
          }
    }
}