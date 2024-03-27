/* eslint-disable vtex/prefer-early-return */
import React, {useState, useEffect} from 'react'
import style from '../stylePromotionBar.css'

import { useDevice } from 'vtex.device-detector'


const CardPost = ({ radioMedia, urlImage, urlImageMobile, linkMedia, urlImageModal, urlImageMobileModal, textAlt, setModalStatus, setModalList }) => {
    const [imagemLink, setTypeImage] = useState();

    const { isMobile } = useDevice()

    useEffect(() => {   
        if(isMobile){
            console.log(urlImageMobile)
            var urlImageMobileLink = urlImageMobile || null
            setTypeImage(urlImageMobileLink ? urlImageMobile : urlImage)
        }else{
            setTypeImage(urlImage)
        }
    }, [isMobile]);

    const handleSubmit = (e) => {
        e.preventDefault()
        setModalStatus(true)
        setModalList({
            "urlImageModal" : urlImageModal,
            "urlImageMobileModal" : urlImageMobileModal,
            "radioMedia" : radioMedia,
            "textAlt" : textAlt
        })
    };

    return (
        <div  className={`${style.linkMedia}` }>
            {
                radioMedia == 'link' && (
                    <a href={linkMedia} target='_blank'>
                        <img src={imagemLink}  className={`${style.mediaSize}`} />
                    </a>
                )
            }

            {
                radioMedia == 'modal' && (
                    <button onClick={handleSubmit}>
                        <img src={imagemLink}  className={`${style.mediaSize}`} />
                    </button>
                )
            }
        </div>
    )
}

export default CardPost
