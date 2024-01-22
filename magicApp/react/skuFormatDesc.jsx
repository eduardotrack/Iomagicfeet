import React from "react";
import { useProduct } from "vtex.product-context"
import styles from "./styles.css"

const skuFormatDesc = () => {
    const productContext = useProduct() || null

    const productDescription = (productContext?.product?.description).replace(/(?:\r\n|\r|\n)/g, '<br>') || ''

    return ( 
        <>
            <div className={styles.skuFormatDesc} dangerouslySetInnerHTML={{__html: productDescription}}></div>
        </>
    )
}

export default skuFormatDesc;