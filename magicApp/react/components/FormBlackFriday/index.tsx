import React, { useState } from "react";

import styles from "./styles.css";
import axios from "axios";

export function FormBlackFriday() {
  const [formSentSuccessfully, setFormSentSuccessfully] = useState<boolean | null>(null);

  // form states
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const [isFemaleSelected, setIsFemaleSelected] = useState(false);
  const [isMaleSelected, setIsMaleSelected] = useState(false);
  const [isKidsSelected, setIsKidsSelected] = useState(false);

  const [isNewsletterOptInChecked, setIsNewsletterOptInChecked] = useState(false);
  const [optInError, setOptInError] = useState(false);



  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let hasError = false;

    if (!nameValue || nameValue.length < 2) {
      setNameError(true);
      hasError = true;
    }

    if (!emailValue) {
      setEmailError(true);
      hasError = true;
    }

    if (!phoneValue || phoneValue.length < 8) {
      setPhoneError(true);
      hasError = true;
    }

    if (isNewsletterOptInChecked === false) {
      setOptInError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }


    const selectedCategories = [
      isFemaleSelected ? 'feminino' : null,
      isMaleSelected ? 'masculino' : null,
      isKidsSelected ? 'infantil' : null,
    ].filter(Boolean).join(', ') || null;

    const fullName = nameValue.trim();
    const [firstName, lastName] = fullName.split(' ').length > 1
      ? fullName.split(' ', 2)
      : [fullName, ''];

    const requestData = JSON.stringify({
      email: emailValue,
      firstName: firstName,
      lastName: lastName || undefined,
      phone: phoneValue,
      isNewsletterOptIn: true,
      interestedIn: selectedCategories,
      marketingAccet: true,
    });

    try {
      await axios.post('/api/dataentities/CL/documents', requestData, {
        headers: { 'Content-Type': 'application/json' }
      });

      setFormSentSuccessfully(true);
    } catch (error) {
      if ((error as any).response && (error as any).response.data.Message === 'duplicated entry') {
        try {
          await axios.patch('/api/dataentities/CL/documents', requestData, {
            headers: { 'Content-Type': 'application/json' }
          });

          setFormSentSuccessfully(true);
        } catch (patchError) {
          console.log('Error during PATCH => ', patchError);
          setFormSentSuccessfully(false);
        }
      } else {
        console.log('Error => ', error);
        setFormSentSuccessfully(false);
      }
    }
  }

  if (formSentSuccessfully === true) {
    return <p className={styles.formSuccess}>Inscrição realizada com sucesso!</p>;
  }

  if (formSentSuccessfully === false) {
    return <p className={styles.formError}>Houve um erro ao realizar sua inscrição. Por favor, tente mais tarde.</p>;
  }

  return (
    <form onSubmit={handleFormSubmit} className={styles.formContainer}>
      <div className={styles.inputsTop}>
        <label className={styles.inputItem}>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Nome"
            className={`${styles.formInput} ${nameError ? styles.errorInput : ''}`}
            value={nameValue}
            onChange={(event) => {
              setNameValue(event.target.value);
              if (event.target.value) setNameError(false);
            }}
          />
          {nameError && <p className={styles.errorMsg}>*Campo obrigatório</p>}
        </label>

        <label className={styles.inputItem}>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="E-mail"
            className={`${styles.formInput} ${emailError ? styles.errorInput : ''}`}
            value={emailValue}
            onChange={(event) => {
              setEmailValue(event.target.value);
              if (event.target.value) setEmailError(false);
            }}
          />
          {emailError && <p className={styles.errorMsg}>*Campo obrigatório</p>}
        </label>

        <label className={styles.inputItem}>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="Whatsapp"
            className={`${styles.formInput} ${phoneError ? styles.errorInput : ''}`}
            value={phoneValue}
            onChange={(event) => {
              setPhoneValue(event.target.value);
              if (event.target.value) setPhoneError(false);
            }}
          />
          {phoneError && <p className={styles.errorMsg}>*Campo obrigatório</p>}
        </label>
      </div>

      <div className={styles.checkboxContainer}>
        <p>Desejo receber promoções e novidades.</p>
        <div className={styles.checkboxOptions}>
          <label className={styles.checkboxItem}>
            Feminino
            <input
              type="checkbox"
              checked={isFemaleSelected}
              onChange={() => setIsFemaleSelected(!isFemaleSelected)}
            />
          </label>
          <label className={styles.checkboxItem}>
            Masculino
            <input
              type="checkbox"
              checked={isMaleSelected}
              onChange={() => setIsMaleSelected(!isMaleSelected)}
            />
          </label>
          <label className={styles.checkboxItem}>
            Infantil
            <input
              type="checkbox"
              checked={isKidsSelected}
              onChange={() => setIsKidsSelected(!isKidsSelected)}
            />
          </label>
        </div>
      </div>

      <div className={styles.checkboxBottom}>
        <label>
          Aceito receber comunicações da magicfeet*
          <input
            type="checkbox"
            checked={isNewsletterOptInChecked}
            onClick={() => {
              setIsNewsletterOptInChecked(!isNewsletterOptInChecked)
              setOptInError(false);
            }}
          />
        </label>
        {optInError && <p className={styles.errorMsg}>*Campo obrigatório</p>}
      </div>


      <button type="submit" className={styles.formBtn}>ENVIAR</button>
    </form>
  );
}
