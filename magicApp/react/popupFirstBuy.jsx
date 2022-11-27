import React, { useState } from 'react';
import styles from "./styles.css"

const popupFirstBuy = () => {
    const [copySuccess, setCopySuccess] = useState('primeiracompra');
     

    function copyToClipboard(e) {

        if ("clipboard" in navigator) {
            navigator.clipboard.writeText("primeiracompra");

          e.target.focus();
            setCopySuccess('copiado!');
        } else {
            document.execCommand("copy", true, "primeiracompra");

            e.target.focus();
            setCopySuccess('copiado!');
        }
    };

    return ( 
        <>
            <div className={`${styles.copiarClipboard} ${copySuccess == 'copiado!' ? styles.copiadoClipboard : ``}`}>
                <button onClick={copyToClipboard}>{copySuccess}</button> 
                <form><textarea  value='primeiracompra' /></form>
            </div>
        </>
    )
}

export default popupFirstBuy;