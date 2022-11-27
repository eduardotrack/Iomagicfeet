import React, { FC } from "react";
import styles from "../../styles.css"

interface Props {
    link: string,
    image: string,
    name: string,
    active: string
}

const ProductSimilarsItem: FC<Props> = ({link, image, active, name}) => {
    return (
            <a href={link} className={`${styles.productLink} ${active == name ? styles.activeImage : ``}`}>
                <img src={image} alt={name} className={styles.productImg} />
            </a>
    )
}

export default ProductSimilarsItem;