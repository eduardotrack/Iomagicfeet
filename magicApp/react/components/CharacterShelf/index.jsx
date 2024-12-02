/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react'

import style from './styles.css'

function CharacterShelf(charactersShelfCore) {
  const [characters, setCharacters] = useState(null)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    if (
      !charactersShelfCore.characters ||
      charactersShelfCore.characters.length === 0
    ) {
      setCharacters([
        {
          image:
            'https://s3-alpha-sig.figma.com/img/643a/aa80/f409ace1f4045ffaf270617414d4e29e?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=STbBoZNJxV35rdiKZhXobmUiNtFJyF4eEEbLD4CJPEqHL7MecjeZi9BILrZZgC8h6skiYdrPnG~teMiSOFokF-0CrXZmkS6hhQxJxzWZpe4N7h22dOjW88RoxQSsKW9th43EW7kSaUhDAnwRwwa0Y2VnSCflpbnUC9xXWKcKuYE-H5ypUGnljLBeNJn3G1qcyCarY91kdjkmLGEcu-H5hAdm4TVYC-9G6sD3QQHaIAe93bwV1jFFI4Yyb05UL8e9Itx5eDTVNpNWAcIcIWyy3k8WSgWEN3vBE9nmtCqF0XMGCIrMS4v9TBZRynNuJYc-39pZ~39fpcj~z607vr3qVg__',
          color: '#FFEBBB',
          name: 'stitch',
          link: '/example',
        },
        {
          image:
            'https://s3-alpha-sig.figma.com/img/1118/ce6f/73306ff51f62be161967b9d392f274dd?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=gjok1CjPXs7AHU4949hkQEdAucqFLPY7ZTti8QWDrTme6WVOKB2YGRjYUtdqJmqJFU5mDLRP1BpzJkDltJjaACU9PT64ZShe3C7aQHIcR7h1qVuoJ8MijLWQbsj7vY17RFZmPmu0YcKGJA3UVAVO3JSkW~dzsU3Y3Ne498vtetj~qfQURvhi81MftzQCRkt2JPmN77a10l~9IIqYWfynYVvBeXJk-Zy03IxmXobGDWRI0VjgS8pH4cguL2wUeD0L1CD68JlSLU3dN0S8TqXQFaCpb28976oTseGCRKfmAkjVfg~2hXzDWtlfGt1oQmKhnGCi7KEFmcqopZx9cTkhVw__',
          color: '#F8DAD6',
          name: 'hello kitty',
          link: '/example',
        },
        {
          image:
            'https://s3-alpha-sig.figma.com/img/0a81/ffc4/7dbc12e89a258a20084889eea118dbc8?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=MjAgRkCet1K4VFHAlzrWfXq8abn1-K8szMfDtBeOATcIDp0t8aHNW~6CvZ16fIT2f5AA7eEFVfkKYYcHQPdvknAvXmM1IaYdHNhpFvfV3zlLEeqmKd5FYiJiHy805i5Wq4DhGapKYIVtujzaOoYnrM3Vp0aV704Nm-qa9s6AvqIOa8IrfyGQ3TmhmvFeGPAeNf9sqGQ3P3~kGdCYkpCvZ-qcCKnUdpK4rj6ztqpx4sdkjM9efFipXaNezBTsZSUYV4TiT6K5b6ijX5KdD5VkNuKU6OGmeEbyPMnwUmApQYMXL3~n9C1TK30zlMBocAzJbz7jnBSm7589~yE6KNbytA__',
          color: '#E9DCFB',
          name: 'mickey mouse',
          link: '/example',
        },
        {
          image:
            'https://s3-alpha-sig.figma.com/img/643a/aa80/f409ace1f4045ffaf270617414d4e29e?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=STbBoZNJxV35rdiKZhXobmUiNtFJyF4eEEbLD4CJPEqHL7MecjeZi9BILrZZgC8h6skiYdrPnG~teMiSOFokF-0CrXZmkS6hhQxJxzWZpe4N7h22dOjW88RoxQSsKW9th43EW7kSaUhDAnwRwwa0Y2VnSCflpbnUC9xXWKcKuYE-H5ypUGnljLBeNJn3G1qcyCarY91kdjkmLGEcu-H5hAdm4TVYC-9G6sD3QQHaIAe93bwV1jFFI4Yyb05UL8e9Itx5eDTVNpNWAcIcIWyy3k8WSgWEN3vBE9nmtCqF0XMGCIrMS4v9TBZRynNuJYc-39pZ~39fpcj~z607vr3qVg__',
          color: '#FFEBBB',
          name: 'stitch',
          link: '/example',
        },
        {
          image:
            'https://s3-alpha-sig.figma.com/img/1118/ce6f/73306ff51f62be161967b9d392f274dd?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=gjok1CjPXs7AHU4949hkQEdAucqFLPY7ZTti8QWDrTme6WVOKB2YGRjYUtdqJmqJFU5mDLRP1BpzJkDltJjaACU9PT64ZShe3C7aQHIcR7h1qVuoJ8MijLWQbsj7vY17RFZmPmu0YcKGJA3UVAVO3JSkW~dzsU3Y3Ne498vtetj~qfQURvhi81MftzQCRkt2JPmN77a10l~9IIqYWfynYVvBeXJk-Zy03IxmXobGDWRI0VjgS8pH4cguL2wUeD0L1CD68JlSLU3dN0S8TqXQFaCpb28976oTseGCRKfmAkjVfg~2hXzDWtlfGt1oQmKhnGCi7KEFmcqopZx9cTkhVw__',
          color: '#F8DAD6',
          name: 'hello kitty',
          link: '/example',
        },
        {
          image:
            'https://s3-alpha-sig.figma.com/img/0a81/ffc4/7dbc12e89a258a20084889eea118dbc8?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=MjAgRkCet1K4VFHAlzrWfXq8abn1-K8szMfDtBeOATcIDp0t8aHNW~6CvZ16fIT2f5AA7eEFVfkKYYcHQPdvknAvXmM1IaYdHNhpFvfV3zlLEeqmKd5FYiJiHy805i5Wq4DhGapKYIVtujzaOoYnrM3Vp0aV704Nm-qa9s6AvqIOa8IrfyGQ3TmhmvFeGPAeNf9sqGQ3P3~kGdCYkpCvZ-qcCKnUdpK4rj6ztqpx4sdkjM9efFipXaNezBTsZSUYV4TiT6K5b6ijX5KdD5VkNuKU6OGmeEbyPMnwUmApQYMXL3~n9C1TK30zlMBocAzJbz7jnBSm7589~yE6KNbytA__',
          color: '#E9DCFB',
          name: 'mickey mouse',
          link: '/example',
        },
      ])
    } else {
      setCharacters(charactersShelfCore.characters)
    }
  }, [])

  return (
    <div className={style.characterShelfContainer}>
      <div className={style.characterShelf}>
        {characters &&
          characters.map((character, index) => (
            <div
              key={index}
              className={`${style.characterShelfItem} ${
                openIndex === index ? style.characterShelfItemOpen : ''
              }`}
              style={{ backgroundColor: character.color }}
              onClick={() => setOpenIndex(index)}
            >
              <img src={character.image} alt="" />
              <div className={style.characterShelfInfo}>
                <p>{character.name}</p>
                <a href={character.link}>compre agora!</a>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

CharacterShelf.schema = {
  title: 'Panda | Personagens favoritos',
  description: 'Adicione itens para a vitrine de personagens favoritos.',
  type: 'object',
  properties: {
    characters: {
      title: 'Lista de Personagens',
      description: 'Você pode mudar a ordem dos itens movimentando-os.',
      type: 'array',
      minItems: 0,
      items: {
        title: 'Personagens',
        type: 'object',
        properties: {
          image: {
            title: 'Imagem do personagem',
            description: 'Adicione a imagem do personagem.',
            type: 'string',
            widget: {
              'ui:widget': 'image-uploader',
            },
            default: null,
          },
          color: {
            title: 'Cor do item',
            description: 'Adicione a cor que ficará ao fundo do personagem.',
            type: 'string',
            default: null,
            widget: {
              'ui:widget': 'color',
            },
          },
          name: {
            title: 'Nome do personagem',
            description:
              'Adicione o nome que aparecerá quando o usuário fizer hover.',
            type: 'string',
            default: null,
          },
          link: {
            title: 'Link de redirecionamento',
            description:
              "Adicione o link para onde o usuário irá ao clicar em 'compre agora'. Ex.: '/example'",
            type: 'string',
            default: null,
          },
        },
      },
    },
  },
}

export default CharacterShelf
