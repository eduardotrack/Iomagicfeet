import { useEffect } from 'react'
import { useProduct } from 'vtex.product-context'
import styles from './VideoPdp.css'

/**
 * Renders a video component for the product details page (PDP).
 * The video component is inserted into the desktop and mobile product images containers.
 *
 * @return {null} Returns null as the component does not render anything to the DOM.
 */

const VideoPdp = () => {
  const { product } = useProduct()

  useEffect(() => {
    console.log('product panda', product)
    if (product) {
      insertVideo(product)
    }
  }, [product])

  return null
}

const insertVideo = (product) => {
  if (product){

    //Pegando a url do video
    const productWithVideo = product?.items?.[0]?.videos?.[0]?.videoUrl ?? "";

    console.log('productWithVideo', productWithVideo)

      if (!productWithVideo) {
        return
      }

     //função para transformar a url do video em um iframe embed
      const getUrl = (youtubeUrl) => {
        const videoId = youtubeUrl.includes('watch?v=')
          ? youtubeUrl.split('watch?v=')[1].split('&')[0] // Extrai o ID do vídeo
          : youtubeUrl.split('/').pop() // caso o link seja de outro formato
        return `https://www.youtube.com/embed/${videoId}`
      }

      const videoUrl = getUrl(productWithVideo)
      console.log('videoUrl', videoUrl)

      //criando o iframe
      const videoContainer = document.createElement('div')
      videoContainer.className = styles.videoContainer

      const iframe = document.createElement('iframe')
      iframe.src = videoUrl
      iframe.width = '100%'
      iframe.height = '100%'
      iframe.frameBorder = '0'
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      iframe.allowFullScreen = true

      //criando a imagem do play do video
      const imgPlayVideoContainer = document.createElement('div');
      imgPlayVideoContainer.className = styles.imgPlayVideoContainer;

      const imgPlayVideo = document.createElement('img');
      imgPlayVideo.src = product.items[0].images[0].imageUrl;
      imgPlayVideo.alt = 'Play Video';

      imgPlayVideoContainer.appendChild(imgPlayVideo);

      // Adicionando evento de clique para esconder o container ao clicar nele
      imgPlayVideoContainer.addEventListener('click', () => {
        console.log('Clicou para iniciar o vídeo');

  // Esconde a imagem de play
  imgPlayVideoContainer.style.display = 'none';

  // Adiciona autoplay ao vídeo
  iframe.src += '?autoplay=1';
      });


      // Inserindo o iframe no container da vtex
      videoContainer.appendChild(iframe)
      videoContainer.appendChild(imgPlayVideoContainer)


      // Observação para não perder o conteudo criado
      const observeProductVideo = () => {
        const observer = new MutationObserver(() => {
          const desktopVideoContainer = document.querySelector('.vtex-store-components-3-x-productVideo');

          if (desktopVideoContainer && !desktopVideoContainer.querySelector('.magicfeet-magicapp-0-x-videoContainer')) {
            console.log('Clicou para iniciar o vídeo');

  // Esconde a imagem de play
  imgPlayVideoContainer.style.display = 'flex';

  // Adiciona autoplay ao vídeo
  iframe.src = videoUrl;
            desktopVideoContainer.appendChild(videoContainer);
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });
      };

      observeProductVideo();

      //trocando a imagem do video no thumbnail
      const containerVideoThumbnail = document.querySelector('.vtex-store-components-3-x-productImagesThumbActive');
      const videoThumbnail = document.querySelector('.vtex-store-components-3-x-figure--video');
      if (videoThumbnail) {
        videoThumbnail.style.display = 'none';

        const videoThumbnailContainer = document.createElement('div');
        videoThumbnailContainer.className = styles.videoThumbnail;

        const videoThumbnailImage = document.createElement('img');
        videoThumbnailImage.src = product.items[0].images[0].imageUrl;
        videoThumbnailImage.alt = 'Imagem Video Thumbnail';

        videoThumbnailContainer.appendChild(videoThumbnailImage);

        if (containerVideoThumbnail && !document.querySelector('.magicfeet-magicapp-0-x-videoThumbnail')) {
          videoThumbnail.insertAdjacentElement('afterend', videoThumbnailContainer);
        }
      }
    }

}

export default VideoPdp
