/* eslint-disable vtex/prefer-early-return */
import React, {useState, useEffect} from 'react'
import style from '../stylePromotionBar.css'

import { useDevice } from 'vtex.device-detector'

const CardModal = ({ dadosModal, setModalStatus }) => {
    const [imagemLink, setTypeImage] = useState();

    const { isMobile } = useDevice()

    useEffect(() => {   
        if(isMobile){
            var urlImageMobileLink = dadosModal.urlImageMobileModal || null
            setTypeImage(urlImageMobileLink ? dadosModal.urlImageMobileModal : dadosModal.urlImageModal)
        }else{
            setTypeImage(dadosModal.urlImageModal)
        }
    }, [isMobile]);
    
    const handleSubmit = (e) => {
        e.preventDefault()
        setModalStatus(false)
    };

    return (
        <div className={`${style.modalBox}`} >
            <div className={`${style.modalOverlay}`} onClick={handleSubmit}></div>
            <div className={`${style.modalBody}`}>
                <button className={`${style.modalClose}`} onClick={handleSubmit}>x</button>
                <div className={`${style.modalImage}`}>
                    <img src={imagemLink} alt={dadosModal.textAlt} className={`${style.modalPostImage}`} />
                </div>
            </div>
        </div>
    )
}

export default CardModal
