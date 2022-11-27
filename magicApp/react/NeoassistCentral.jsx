import React, { useEffect, useLayoutEffect } from 'react';


function NeoassistCentral(){
    function addNeoAssistTag() {
        const script = window.document.createElement('script');
        script.src = '//cdn.atendimen.to/n.js';
        script.async = false;
        script.defer = true;
        setTimeout(() => document.head.appendChild(script), 3300); 
    }

    useEffect(() => {
        addNeoAssistTag();
    }, []);

    useLayoutEffect(() => {
        addNeoAssistTag();
    }, []);
 
    return(
        <>
            <div>
                <div id="NeoassistCentral"></div>
            </div>
        </>
    )
}

export default NeoassistCentral;