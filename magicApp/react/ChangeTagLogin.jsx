import { useEffect } from "react";

const ChangeTagLogin = () => {
useEffect(() => {

    const handleTransformTitle = () => {
      if (window.location.pathname === '/login') {

        const h3Element = document.querySelector('.vtex-login-2-x-contentForm h3.vtex-login-2-x-formTitle');
        if (h3Element) {
          const h1Element = document.createElement('h1');
          h1Element.className = h3Element.className;
          h1Element.textContent = h3Element.textContent;
          h3Element.parentNode.replaceChild(h1Element, h3Element);
        }
      }
    };


    setTimeout(() => {
      handleTransformTitle();
    }
    , 2000);
  }, []);


  return <></>;
}

export default ChangeTagLogin;
