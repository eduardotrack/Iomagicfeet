import { useQuery } from "react-apollo";
import { useProduct } from "vtex.product-context";
import ProductSimilarsItem from "./ProductSimilarsItem";

import { Product } from "vtex.product-context/react/ProductTypes";
import GET_PRODUCTS from "../../graphql/products.graphql";

import styles from "../../styles.css";

const ProductSimilars = () => {
    const productContext = useProduct() || null

    const refId = productContext?.product?.productReference || '';
    const corProperty = productContext?.product?.specificationGroups?.[0]?.specifications?.find(spec => spec.name === 'Cor');
    const cor = corProperty?.values || '';

    const refFinal = `specificationFilter_15:${refId.trim().replace(/-[0-9a-z]{3}/, "")}`

    const {loading, error, data} = useQuery(GET_PRODUCTS, {
        variables: {
            term: refFinal
        }
    });

    const similars:[Product] = data?.products || null
    console.log("no similares",similars)

    if(loading || error) return null

    const productRefControl = productContext?.selectedItem?.referenceId[0].Value.split("-")  || ''

    const active = productRefControl[0] + "-" + productRefControl[1] + "-" + productRefControl[2] || 'Vazio'

    return (
        <>
            <span className={styles.title}>escolha a <b>cor: {cor}</b></span>
            <div className={styles.cardNormal}>

                {
                    similars && similars.map((item) => {

                        if(item.items[0].images.length != 0){
                            let objImg = item.items[0].images.find(o => o.imageLabel === 'Principal') || null;

                            if(objImg){
                                return (
                                    <ProductSimilarsItem link={`/${item.linkText}/p`} active={active}  image={objImg.imageUrl} key={item.items[0].itemId} name={item.productReference}  />
                                )
                            }else{
                                return(
                                    <ProductSimilarsItem link={`/${item.linkText}/p`} active={active}  image={item.items[0].images[0].imageUrl} key={item.items[0].itemId} name={item.productId}  />
                                )
                            }
                        }else{
                            return
                        }


                    })
                }

            </div>
        </>
    )
}

export default ProductSimilars;
