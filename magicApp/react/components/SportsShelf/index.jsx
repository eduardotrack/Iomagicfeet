/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import Slider from 'react-slick'

import style from './styles.css'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

function SportsShelf(sportsShelfCore) {
  if (!sportsShelfCore.cards || sportsShelfCore.cards.length === 0) return <></>

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <div className={style.sportsShelfSlider}>
      <Slider {...settings}>
        {sportsShelfCore.cards.map((card, index) => {
          return (
            <div key={index}>
              <a
                className={style.sportsShelfCard}
                href={card.link}
                style={{ backgroundColor: card.color }}
              >
                <div className={style.sportsShelfCardImage}>
                  <img src={card.image} alt={card.title} loading='lazy'/>
                </div>

                <div
                  className={style.sportsShelfCardTitle}
                  style={{
                    backgroundColor: card.color,
                    left: card.side === 'esquerda' ? '0' : 'auto',
                    right: card.side === 'direita' ? '0' : 'auto',
                  }}
                >
                  {card.title}
                </div>
                <p className={style.sportsShelfCTA}>
                  {card.cta}{' '}
                  <span>
                    <svg
                      width="11"
                      height="17"
                      viewBox="0 0 11 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.65198 16L9.75448 8.5L1.65198 1"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </p>
              </a>
            </div>
          )
        })}
      </Slider>
    </div>
  )
}

SportsShelf.schema = {
  title: 'Panda | Vitrine Esportes',
  description: 'Adicione itens para a vitrine de esportes.',
  type: 'object',
  properties: {
    cards: {
      title: 'Lista de Cards',
      description: 'Você pode mudar a ordem dos itens movimentando-os.',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Cards',
        type: 'object',
        properties: {
          image: {
            title: 'Imagem do card',
            description: 'Adicione a imagem do card.',
            type: 'string',
            widget: {
              'ui:widget': 'image-uploader',
            },
            default: null,
          },
          color: {
            title: 'Cor do card',
            description: 'Adicione a cor que ficará ao fundo do card.',
            type: 'string',
            default: null,
            widget: {
              'ui:widget': 'color',
            },
          },
          title: {
            title: 'Título do card. Ex: "basquete"',
            description: 'Adicione o nome que aparecerá em destaque no card.',
            type: 'string',
            default: null,
          },
          side: {
            title: 'Lado do título do card',
            description: 'Escolha o lado que o título ficará.',
            type: 'string',
            enum: ['esquerda', 'direita'],
            default: 'direita',
          },
          link: {
            title: 'Link de redirecionamento',
            description:
              "Adicione o link para onde o usuário irá ao clicar no card. Ex.: '/example'",
            type: 'string',
            default: null,
          },
          cta: {
            title: 'CTA - Chamada para ação',
            description:
              "Adicione o texto que aparecerá no footer do card. Ex.: 'compre agora'",
            type: 'string',
            default: null,
          },
        },
      },
    },
  },
}

export default SportsShelf
