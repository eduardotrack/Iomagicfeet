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

    return (
        <a href="/account">
            <p className={styles.welcomeControl}>olá, <b>{welcome}</b></p>
        </a>
    );
};

export default WelcomeControl;
