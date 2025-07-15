import React, { useEffect, useState } from "react";
import styles from "./styles.css";

const WelcomeControl = () => {
    const [welcome, setWelcome] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/no-cache/profileSystem/getProfile');
                const res = await response.json();
                if (res.IsUserDefined) {
                    setWelcome(res.FirstName);
                } else {
                    setWelcome('visitante');
                }
            } catch (error) {
                setWelcome('visitante');
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, []);

    if (welcome !== 'visitante') {
      return (
        <a href="/account" className={`${styles.welcomeControlLink} ${styles.welcomeControlLinkLogged}`}>
          <p className={styles.welcomeControl}>olá, <b>{welcome}</b></p>
          <span className={styles.welcomeControlBtn}>minha conta</span>
        </a>
      )
    }

    return (
      <div className={styles.welcomeControlWrapper}>
        <a href="/account" className={`${styles.welcomeControlLink}`}>
          <p className={styles.welcomeControl}>olá, <b>{welcome}</b></p>
        </a>
        <div className={styles.welcomeControlLinks}>
          <a href="/login" className={styles.welcomeControlLinkItem}>ENTRAR</a>
          <a href="/account/#/orders" className={styles.welcomeControlLinkItem}>MEUS PEDIDOS</a>
        </div>
      </div>
    );
};

export default WelcomeControl;
