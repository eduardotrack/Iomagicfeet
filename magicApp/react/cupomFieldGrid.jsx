import React, {useEffect, useState} from "react";
import { useProduct } from "vtex.product-context"
import style from "./styleCupomGrid.css"

const cupomFieldGrid = () => { 
    const productContext = useProduct() || null
    const [cupom, updateCupom] = useState(false);

    useEffect(() => {  
        var productClusters = productContext?.product?.productClusters || null        

        productClusters.forEach(cluster => {
            if(cluster.id == '324'){
                updateCupom(true)
            }
        });
    }, []);

    return ( 
        <>  
            { cupom &&
                <p className={`${style.tag}`}>USE O CUPOM <b>ADIDAS20</b> E <b>GANHE + 20% OFF</b></p>
            }
        </>
    )

}

export default cupomFieldGrid;