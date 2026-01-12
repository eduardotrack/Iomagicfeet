import { useEffect, useRef } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './VideoPdp.css'

/**
 * Renders a video component for the product details page (PDP).
 * The video component is inserted into the desktop and mobile product images containers.
 *
 * @return {null} Returns null as the component does not render anything to the DOM.
 */

const VideoPdp = () => {
  const { product, selectedItem } = useProduct()
  const observerRef = useRef(null)

  useEffect(() => {
    if (!product) return

    setTimeout(() => {
      insertVideo(product, observerRef)
    }, 500)

    return () => {
      // Garantindo que o observer seja removido ao desmontar
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [product, selectedItem])

  return null
}

const insertVideo = (product, observerRef) => {
  if (!product) return

  //Pegando a url do video
  const productWithVideo = product?.items?.[0]?.videos?.[0]?.videoUrl ?? ''

  console.log('productWithVideo', productWithVideo)

  if (!productWithVideo) return

  //função para transformar a url do video em um iframe embed
  const getUrl = (youtubeUrl) => {
    const videoId = youtubeUrl.includes('watch?v=')
      ? youtubeUrl.split('watch?v=')[1].split('&')[0] // Extrai o ID do vídeo
      : youtubeUrl.split('/').pop() // caso o link seja de outro formato
    return `https://www.youtube.com/embed/${videoId}`
  }

  const videoUrl = getUrl(productWithVideo)
  console.log('videoUrl', videoUrl)

  // Evita recriar o vídeo se ele já existir
  if (document.querySelector(`.${styles.videoContainer}`)) return

  //criando o iframe
  const videoContainer = document.createElement('div')
  videoContainer.className = styles.videoContainer

  const iframe = document.createElement('iframe')
  iframe.src = videoUrl
  iframe.width = '100%'
  iframe.height = '100%'
  iframe.frameBorder = '0'
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  iframe.allowFullScreen = true

  //criando a imagem do play do video
  const imgPlayVideoContainer = document.createElement('div')
  imgPlayVideoContainer.className = styles.imgPlayVideoContainer

  const imgPlayVideo = document.createElement('img')
  imgPlayVideo.src = product.items[0].images[0].imageUrl
  imgPlayVideo.alt = 'Play Video'

  imgPlayVideoContainer.appendChild(imgPlayVideo)

  // Adicionando evento de clique para esconder o container ao clicar nele
  imgPlayVideoContainer.addEventListener('click', () => {
    console.log('Clicou para iniciar o vídeo')

    // Esconde a imagem de play
    imgPlayVideoContainer.style.display = 'none'

    // Adiciona autoplay ao vídeo
    iframe.src = `${videoUrl}?autoplay=1`
  })

  // Inserindo o iframe no container da vtex
  videoContainer.appendChild(iframe)
  videoContainer.appendChild(imgPlayVideoContainer)

  // Observação para não perder o conteudo criado
  const observeProductVideo = () => {
    if (observerRef.current) return

    observerRef.current = new MutationObserver(() => {
      const desktopVideoContainer = document.querySelector(
        '.vtex-store-components-3-x-productVideo'
      )

      if (
        desktopVideoContainer &&
        !desktopVideoContainer.querySelector(`.${styles.videoContainer}`)
      ) {
        console.log('Inserindo vídeo no container')

        // Reseta estado do vídeo
        imgPlayVideoContainer.style.display = 'flex'
        iframe.src = videoUrl

        desktopVideoContainer.appendChild(videoContainer)
      }
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  observeProductVideo()

  //trocando a imagem do video no thumbnail
  const containerVideoThumbnail = document.querySelector(
    '.vtex-store-components-3-x-productImagesThumbActive'
  )
  const videoThumbnail = document.querySelector(
    '.vtex-store-components-3-x-figure--video'
  )

  console.log('videopdp videoThumbnail', videoThumbnail)

  if (videoThumbnail) {
    videoThumbnail.style.display = 'none'

    console.log('document videothumbnail', document.querySelector(`.${styles.videoThumbnail}`))

    if (!document.querySelector(`.${styles.videoThumbnail}`)) {
      console.log('entrou no videothumbnail')
      const videoThumbnailContainer = document.createElement('div')
      videoThumbnailContainer.className = styles.videoThumbnail

      const videoThumbnailImage = document.createElement('img')
      videoThumbnailImage.src = product.items[0].images[0].imageUrl
      videoThumbnailImage.alt = 'Imagem Video Thumbnail'

      videoThumbnailContainer.appendChild(videoThumbnailImage)
      console.log('tem containerVideoThumbnail', containerVideoThumbnail)

      if (videoThumbnail) {
        videoThumbnail.style.display = 'block'

        const img = videoThumbnail.querySelector('img')

        if (img) {
          img.src = product.items[0].images[0].imageUrl
          img.alt = 'Imagem Video Thumbnail'
        }
      }
    }
  }
}

export default VideoPdp
