import React from "react";
import { useQuery } from "react-apollo";
import { useProduct } from "vtex.product-context"
 
import GET_PRODUCTS from "../../graphql/suggestion.graphql"

import styles from "../../styles.css"

const SkuSuggestion = () => { 
    const productContext = useProduct() || null

    const categoryTree = productContext?.product?.categoryTree || ''
    const sizeSelected = productContext?.selectedItem?.variations[0]?.values[0]
    const useFilter =  productContext?.product?.specificationGroups[0].specifications
    
    var categoryList = ''
    var categoryListUrl = ""
    var mapCategory = ""

    var useList = []

    categoryTree && categoryTree.map((item) => {
        categoryList += '/'+ item.id
        categoryListUrl+= '/'+ item.name
        mapCategory+= 'c,'
    })

    var categoryList = categoryList.substring(1)

    const useFilterValues = Object.values(useFilter);

    for (const value of useFilterValues) {
        if(value.name == "Ocasião de Uso"){
            for(var i = 0; i < value.values.length; i++){
                var use = value.values[i]
                useList.push(`specificationFilter_6:${use}`);
            }
        }
    }

    useList.push(`specificationFilter_12:${sizeSelected}`)

    const {loading, error, data} = useQuery(GET_PRODUCTS, {
        variables: {
            term: useList,
            category: categoryList
        }
    });

 

    var urlSearchSuggestion = categoryListUrl + '/' + sizeSelected + '?map=' + mapCategory + 'selecione-o-tamanho'

    const suggestions = data?.products || null

    if(loading || error) return null

    if(suggestions.length != 0){
        var mapSize = suggestions.length

        return ( 
            <>
                    <div className={styles.suggestionsBody}>
                        <div className={styles.suggestionsHeader}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" viewBox="0 0 43 43">
                                <g id="Grupo_1" data-name="Grupo 1" transform="translate(-1088 -620)">
                                    <text id="_" data-name="!" transform="translate(1107 649)" fill="#333" font-size="20" font-family="WorkSans-Bold, Work Sans" font-weight="700"><tspan x="0" y="0">!</tspan></text>
                                    <g id="Retângulo_6" data-name="Retângulo 6" transform="translate(1088 620)" fill="none" stroke="#ddd" stroke-width="1">
                                    <rect width="43" height="43" rx="10" stroke="none"/>
                                    <rect x="0.5" y="0.5" width="42" height="42" rx="9.5" fill="none"/>
                                    </g>
                                </g>
                            </svg>

                            <h6>
                                Ops, este produto está <b>indisponível no momento</b>,<br /> selecionamos um <b>TOP {mapSize} de produtos similares,</b> tamanho {sizeSelected}:
                            </h6>
                        </div>

                        
                        <ul>
                            {
                                suggestions && suggestions.map((item, index) => {
                                    let objImg = item.items[0].images.find(o => o.imageLabel === 'Principal') || null;
            
                                    if(objImg){
                                        return (
                                            <li>
                                                <a href={`/${item.linkText}/p`}  key={item.items[0].itemId}>
                                                    <strong>{index + 1}</strong>
                                                    <img src={objImg.imageUrl} alt={item.productName}  />
                                                    <p>{item.productName}</p>
                                                    <span>quero ver!</span>
                                                </a>
                                            </li>
                                        )
                                    }else{
                                        return(
                                            <li>
                                                <a href={`/${item.linkText}/p`}  key={item.items[0].itemId}>
                                                    <strong>{index + 1}</strong>
                                                    <img src={item.items[0].images[0].imageUrl} alt={item.productName}  />
                                                    <p>{item.productName}</p>
                                                    <span>quero ver!</span>
                                                </a>
                                            </li>
                                        )
                                    }
                                })
                            }
                        </ul> 

                        <a href={urlSearchSuggestion} className={styles.suggestionsSeeAll}>quero ver todos os similares</a>  
                    </div>
                        
            </>
        )
    }else{
        return(
            <>
                <div className={styles.suggestionsHeader}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="43" height="43" viewBox="0 0 43 43">
                        <g id="Grupo_1" data-name="Grupo 1" transform="translate(-1088 -620)">
                            <text id="_" data-name="!" transform="translate(1107 649)" fill="#333" font-size="20" font-family="WorkSans-Bold, Work Sans" font-weight="700"><tspan x="0" y="0">!</tspan></text>
                            <g id="Retângulo_6" data-name="Retângulo 6" transform="translate(1088 620)" fill="none" stroke="#ddd" stroke-width="1">
                            <rect width="43" height="43" rx="10" stroke="none"/>
                            <rect x="0.5" y="0.5" width="42" height="42" rx="9.5" fill="none"/>
                            </g>
                        </g>
                    </svg>
                            
                    <h6>
                        Ops, este produto está <b>indisponível no momento</b>.
                    </h6>
                </div>
            </>
        )
    }

}

export default SkuSuggestion;