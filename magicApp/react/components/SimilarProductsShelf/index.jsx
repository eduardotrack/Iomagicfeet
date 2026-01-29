import { useQuery } from "react-apollo";
import { useProduct } from "vtex.product-context";
import { useDevice } from "vtex.device-detector";
import Slider from "react-slick";

import GET_PRODUCTS from "../../graphql/products.graphql";
import { ProductCard } from "./productCard";

import styles from './styles.css'

export const SimilarProductsShelf = () => {
  const { device } = useDevice()
  const isDesktop = device === 'desktop'

  const settings = {
    arrows: isDesktop ? true : false,
    dots: true,
    infinite: true,
    speed: 400,

    nextArrow: <SimilarProductsNextArrow />,
    prevArrow: <SimilarProductsPrevArrow />,

    swipe: true,
    draggable: true,
    touchMove: true,

    slidesToShow: isDesktop ? 4 : 2,
    slidesToScroll: isDesktop ? 4 : 2,
    centerPadding: '2px',

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2
        }
      }
    ]
  }

  const productContext = useProduct() || null
  console.log('productContext', productContext)
  const sizeSelected = productContext?.selectedItem?.variations[0]?.values[0]
  const useFilter =  productContext?.product?.specificationGroups[0].specifications
  const categoryTree = productContext?.product?.categoryTree || ''
  var categoryList = ""

  var useList = []

   categoryTree && categoryTree.map((item) => {
        categoryList += '/'+ item.id
    })

  var categoryList = categoryTree[0]?.id.toString() || ''

  const useFilterValues = Object.values(useFilter);

  for (const value of useFilterValues) {
      if(value.name == "Cor"){
          for(var i = 0; i < value.values.length; i++){
              var use = value.values[i]
              useList.push(`specificationFilter_8:${use}`);
          }
      }
      if(value.name == "Ocasião de Uso"){
          for(var i = 0; i < value.values.length; i++){
              var use = value.values[i]
              useList.push(`specificationFilter_6:${use}`);
          }
      }
  }

  useList.push(`specificationFilter_12:${sizeSelected}`)
  console.log('categoryList', categoryList)
  const {loading, error, data} = useQuery(GET_PRODUCTS, {
      variables: {
          term: useList,
          category: categoryList
      }
  });

  const suggestions = data?.products || []
  const suggestionsFiltered = suggestions?.filter(item => item.productId !== productContext?.product?.productId)
  console.log('suggestions', suggestions)

  if(loading || error) return null

  return (
    <div className={styles.customShelfWrapper}>
      {suggestionsFiltered.length > 0 ? (
        <Slider {...settings}>
          {suggestionsFiltered.map((item, index) => (
            <div key={index}>
              <ProductCard product={item} />
            </div>
          ))}
        </Slider>
      ) : <></>
      }
    </div>
  )
}

function SimilarProductsNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      <svg width="25" height="25" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.307567 10.9174C-0.101985 10.52 -0.102343 9.86278 0.306775 9.46492L3.47527 6.38364C3.91575 5.95529 3.91575 5.24784 3.47527 4.81949L0.306775 1.7382C-0.102343 1.34034 -0.101985 0.68315 0.307567 0.285739C0.700355 -0.0954056 1.32493 -0.0954057 1.71772 0.285739L6.38911 4.81866C6.83073 5.24718 6.83073 5.95594 6.38911 6.38447L1.71772 10.9174C1.32493 11.2985 0.700354 11.2985 0.307567 10.9174Z" fill="#1C1C1C"/>
      </svg>
    </div>
  );
}

function SimilarProductsPrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      <svg width="25" height="25" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.41265 10.9174C6.8222 10.52 6.82256 9.86278 6.41344 9.46492L3.24495 6.38364C2.80447 5.95529 2.80447 5.24784 3.24495 4.81949L6.41344 1.7382C6.82256 1.34034 6.8222 0.68315 6.41265 0.285739C6.01986 -0.0954056 5.39528 -0.0954057 5.00249 0.285739L0.331102 4.81866C-0.110512 5.24718 -0.110512 5.95594 0.331103 6.38447L5.0025 10.9174C5.39528 11.2985 6.01986 11.2985 6.41265 10.9174Z" fill="#1C1C1C"/>
      </svg>
    </div>
  );
}

