import React, { useEffect, useState } from 'react';

function NeoassistScript() {
  const [divExists, setDivExists] = useState(false);

  useEffect(() => {
    console.log('Panda esta tentando iniciar a NEO.')

    // Timeout para executar o script após 5 segundos
    const timeout = setTimeout(() => {
      loadNeoAssistScript();
    }, 3000);

    // Verifica a existência da div a cada 100ms
    const checkDiv = setInterval(() => {
      const div = document.getElementById('NeoassistCentral');
      if (div) {
        clearInterval(checkDiv);
        setDivExists(true);
        clearTimeout(timeout); // Limpa o timeout se a div foi encontrada
        loadNeoAssistScript()
      }
    }, 100);

    return () => {
      clearInterval(checkDiv);
      clearTimeout(timeout); // Limpa o timeout na desmontagem
    };


  }, []);

  const loadNeoAssistScript = () => {

    console.log('Panda executou a NEO.')

    // Lógica para carregar o script do NeoAssist, similar ao código original
    window.NeoAssistTag = {};
    NeoAssistTag.querystring = true;
    NeoAssistTag.pageid = '';
    NeoAssistTag.clientdomain = 'authenticfeet.neoassist.com';
    NeoAssistTag.initialize = {};

    const na = document.createElement('script');
    na.type = 'text/javascript';
    na.async = true;
    na.src = 'https://cdn.atendimen.to/n.js';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(na, s);
  };

  return (<></>);
}

export default NeoassistScript;
