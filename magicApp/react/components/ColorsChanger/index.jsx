import { useEffect } from 'react'

export function ColorsChanger({
  desktopTextColor = '#ed1c24',
  mobileBackgoundColor = '#1C1C1C',
  mobileTextColor = '#E8E8E8',
}) {
  useEffect(() => {
    const hexaForBgImage = mobileTextColor.replace('#', '%23')
    const style = document.createElement('style')
    style.innerHTML = `
      .vtex-menu-2-x-menuItem--main-menu-department:last-child .vtex-menu-2-x-styledLinkContent--main-menu-department {
        color: ${desktopTextColor} !important;
      }
        .vtex-store-drawer-0-x-openIconContainer--menu-mobile-nivel01:last-child .vtex-rich-text-0-x-paragraph--menu-mobile-nivel01 {
          background-color: ${mobileBackgoundColor} !important;
          color: ${mobileTextColor} !important;

          &::after {
            background-image: url("data:image/svg+xml,%3Csvg width='9' height='14' viewBox='0 0 9 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.835773 12.718C0.390278 12.3206 0.389901 11.624 0.834964 11.2261L4.7287 7.74555C5.17344 7.348 5.17344 6.652 4.7287 6.25445L0.834965 2.77387C0.389901 2.37603 0.390278 1.67939 0.835772 1.28204L1.04691 1.09371C1.4262 0.755412 1.9989 0.755412 2.37819 1.09371L8.16331 6.25372C8.60913 6.65137 8.60913 7.34863 8.16332 7.74628L2.37819 12.9063C1.99891 13.2446 1.4262 13.2446 1.04691 12.9063L0.835773 12.718Z' fill='${hexaForBgImage}'/%3E%3C/svg%3E%0A");
          }
        }
    `
    document.head.appendChild(style)

    // cleanup
    return () => style.remove()
  }, [desktopTextColor])

  return null
}

ColorsChanger.schema = {
  title: 'Panda | Mudar cor menu',
  type: 'object',
  properties: {
    desktopTextColor: {
      title: 'Cor do último item do menu',
      description: 'Cor usada no texto do último item do menu desktop e mobile.',
      type: 'string',
      default: '#ed1c24',
    },
    mobileBackgoundColor: {
      title: 'Cor de fundo (mobile)',
      description: 'Cor usada no fundo do último item do menu mobile.',
      type: 'string',
      default: '#1C1C1C',
    },
    mobileTextColor: {
      title: 'Cor do texto (mobile)',
      description: 'Cor usada no texto do último item do menu mobile.',
      type: 'string',
      default: '#E8E8E8',
    },
  },
}
