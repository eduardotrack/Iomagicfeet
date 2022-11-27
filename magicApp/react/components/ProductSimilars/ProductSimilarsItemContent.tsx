import React, { FC } from "react";
import styles from "../../styles.css"

interface Props {
    link: string,
    name: string,
    active: string
}

const ProductSimilarsItemContent: FC<Props> = ({link, active, name}) => {
    return (
            <a href={link} className={`${styles.productLinkContent} ${active == name ? styles.activeContent : ``}`} >
                <p>{name}</p>
            </a>
    )
}

export default ProductSimilarsItemContent;