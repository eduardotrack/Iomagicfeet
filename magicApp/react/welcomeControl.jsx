import React, { useState, useEffect } from "react";
import styles from "./styles.css"
 
const welcomeControl = () => {
    const [welcome, setWelcome] = useState('');
        useEffect(() => {
            $.getJSON('/no-cache/profileSystem/getProfile', function(res) { 
                if(res.IsUserDefined){
                    setWelcome(`${res.FirstName}`)
                }else{
                    setWelcome(`visitante`)
                }
            });
        }, []);

    return (
        <a href="/account"><p className={styles.welcomeControl}>olá, <b>{welcome}</b></p></a>
    )
}

export default welcomeControl;