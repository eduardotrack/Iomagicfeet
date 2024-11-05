import React, { useEffect } from "react";

function getElementByContent(selector, content, callback) {
  let intervalControl = 0;

  const findElement = setInterval(() => {
    const elements = document.querySelectorAll(selector);
    const elementWithContent = Array.from(elements).find(element => element.textContent.trim() === content);

    intervalControl++;

    if (elementWithContent || intervalControl > 20) {
      clearInterval(findElement);
      if (elementWithContent) {
        callback(elementWithContent);
      } else {
        console.log("Elemento para alterar o texto não foi encontrado");
      }
    }
  }, 500);
}

function ChangePurchaseConfirmationMessage() {
  useEffect(() => {
    getElementByContent(
      ".vtex-order-placed-2-x-noticeListItem",
      "A aprovação do pagamento pode levar de 5 minutos até 5 dias úteis.",
      (element) => {
        element.textContent = "A aprovação do pagamento pode levar de 5 minutos até 72 horas.";
      }
    );
  }, []);

  return (<></>);
}

export default ChangePurchaseConfirmationMessage;
