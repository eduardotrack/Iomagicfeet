import { useEffect } from "react";
import axios from "axios";

export default function ClearCep() {
  function clearCep() {
    // limpa o cookie de sessão
    // document.cookie = "cookieSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // remove o cep do localStorage
    localStorage.removeItem("cepStartMagic");

    // reseta a sessão na VTEX
    const data = {
      public: {
        country: {
          value: 'BRA'
        },
        postalCode: {
          value: '' // zera o CEP
        }
      }
    };

    axios.patch('/api/sessions', data, {
      headers: {
        contentType: 'application/json',
        Accept: 'application/vnd.vtex.ds.v10+json',
        dataType: 'json'
      },
      timeout: 5000
    })
    .then(response => {
      console.log("CEP resetado:", response);
      // dando reload na página pra refletir
      window.location.reload();
    })
    .catch(error => {
      console.error("Erro ao resetar CEP:", error);
    });
  }

  useEffect(() => {
    // verifica se já limpou o CEP nesta sessão
    const isCleared = localStorage.getItem("cepClearedMagic") === "true"

    if (!isCleared) {
      clearCep();
      localStorage.setItem("cepClearedMagic", "true");
    }
  }, [])

  return <></>

}