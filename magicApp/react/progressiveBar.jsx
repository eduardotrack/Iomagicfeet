import React from 'react';

import { useQuery } from "react-apollo";
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import GET_PRODUCTS from "./graphql/progressiveBar.graphql"

import styles from "./styles.css"

const progressiveBar = () => {
     const orderForm = useOrderForm()
     const itens = orderForm.orderForm.items
        
     if (itens.length > 0) {
        const references = []

         for (var i = 0; i < itens.length; i++) {
             const productRefId = itens[i].productRefId
             references.push(`${productRefId}`);     
         }

         const {loading, error, data} = useQuery(GET_PRODUCTS, {
                 variables: {
                    reference: references
                 }
             });
 
             const clusters = data || null

             if(loading || error) return null

             if(clusters){
                var count = 0

                for(var i = 0; i < clusters.productsByIdentifier.length; i++){
                    const useFilterValues = Object.values(clusters.productsByIdentifier[i].productClusters);

                    for (const value of useFilterValues) {
                        if(value.name == "Black Friday 2022"){
                            count++
                        }
                    }
                }

               
             }

        var step = 1
        var percentage = 'Adicione mais um produto com selo e ganhe 20% de Desconto!'
        var arrowCount = 32
        
        if(count == 0){
            var step = 1
            var percentage = 'Adicione mais 2 produtos com selo e ganhe 20% de Desconto!'
            var arrowCount = 32
        }else if(count >= 4){
            step = 4
            percentage = 'Quantidade necessária atingida!'
            arrowCount = 93
        }else if((count < 4) && (count >= 3)){
            step = 3
            percentage = 'Adicione mais um produto com selo e ganhe 40% de Desconto!'
            arrowCount = 93
        }else if((count < 3) && (count >= 2)){
            step = 2
            percentage = 'Adicione mais um produto com selo e ganhe 30% de Desconto!'
            arrowCount = 63
        }

        console.log(step)
     }

      return ( 
        <>
             <div id="progressiveBar_popup" className={`${styles.progressiveBar_popup} ${styles.progressiveBar_popup_closed}`}>
                <div className={styles.progressiveBar_popup__body}>
                    <p>Adicione em seu carrinho produtos com <b>selo de Black Friday</b> e ganhe até <b>40% de desconto</b></p>

                    <div className={styles.progressiveBar_popup__bar} >
                        <div>
                            <p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                                    <g id="Grupo_1" data-name="Grupo 1" transform="translate(-1517 -988)">
                                        <g id="Elipse_4" data-name="Elipse 4" transform="translate(1517 988)" fill="none" stroke="#fff" stroke-width="1">
                                        <circle cx="9" cy="9" r="9" stroke="none"/>
                                        <circle cx="9" cy="9" r="8.5" fill="none"/>
                                        </g>
                                        <text id="_" data-name="!" transform="translate(1524 1001)" fill="#fff" font-size="11" font-family="Lato-Black, Lato" font-weight="800"><tspan x="0" y="0">!</tspan></text>
                                    </g>
                                </svg>

                                {percentage}
                            </p>

                            <div className={styles.progressiveBar_popup__arrow} style={{marginLeft:`${arrowCount}%`}}></div>
                        </div>

                        <ul>
                            <li className={`${styles.progressiveBar_popup__number}  ${styles.progressiveBar_popup__number_active}`} data-itens-value="0"><span> 0% </span></li>
                            <li className={`${styles.progressiveBar_popup__number} ${count >= 2 ? styles.progressiveBar_popup__number_active : ``} ${step == 1 ? styles.progressiveBar_popup__number_next : ``}`} data-itens-value="2"><span> 20% </span></li>
                            <li className={`${styles.progressiveBar_popup__number} ${count >= 3 ? styles.progressiveBar_popup__number_active : ``} ${step == 2 ? styles.progressiveBar_popup__number_next : ``}`} data-itens-value="3"><span> 30% </span></li>
                            <li className={`${styles.progressiveBar_popup__number} ${count >= 4 ? styles.progressiveBar_popup__number_active : ``} ${step == 3 ? styles.progressiveBar_popup__number_next : ``}`} data-itens-value="4"><span> 40% </span></li>
                        </ul>

                        <strong style={{background:`linear-gradient(90deg, #5dff49 ${step == 4 ? 100 : count * 20}%, #ddd  ${step == 4 ? 100 : count * 20}%)`}}></strong>
                    </div>
                </div>
            </div>
        </>
    )
}

export default progressiveBar;