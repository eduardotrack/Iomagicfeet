import React, { useState, useEffect } from 'react';
import styles from "./styles.css"
import api from "./services/apiNews";

const popupNewsletter = () => {
    const [formData, updateFormData] = useState();

    const [msg, setMsg] = useState('Obrigado! Fique de olho no e-mail, você receberá ótimas novidades por lá.');
    const [show, setShow] = useState(false);
    const [type, setType] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');

        script.src = "/arquivos/newsModalTrigger.js?v=3";
        script.async = true;

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        }
      }, []);

    const activateLasers = (e) =>{
        e.preventDefault()

        document.getElementById("overlayModalnews").style.display = "none";
        document.getElementById("showModalnews").style.display = "none";
    }

    const handleChange = (e) => {
        updateFormData({

          ...formData,
          [e.target.name]: e.target.value.trim()
        });
      };

      const handleSubmit = (e) => {
        e.preventDefault()

        api.post("integracao", formData,{
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((response) => {

            document.getElementById("form-news").reset();

            setMsg('Obrigado! Fique de olho no e-mail, você receberá ótimas novidades por lá.')
            setShow(true)
            setType(true)

            rrApi.setEmail(formData.email);
        })
        .catch((err) => {
            const errType = err.message

            if(errType == 'Erro ao inserir os dados, tente novamente'){
                setMsg('Erro ao inserir os dados, tente novamente.')
                setShow(true)
                setType(false)
            }else{

                setShow(true)
                setType(false)
            }
        });
      };

    return (
        <>
            <div id="overlayModalnews" onClick={activateLasers} className={`${styles.overlayModalnews}`}></div>

            <div id="showModalnews" className={`${styles.coreModalnews}`}  style={{ display: 'none' }}  >
                <div className={`${styles.Modalnews}`}>
                    <div className={`${styles.headerModalnews}`}>
                        <button type="button" onClick={activateLasers} className={`${styles.closeModalnews}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
                        </button>

                        <h5>Fique por dentro de todos </h5>
                        <h6>Lançamentos & Novidades</h6>
                    </div>

                    <div className={`${styles.bodyModalnews}`}>
                        <form id="form-news" className={`${styles.formNews}`} onSubmit={handleSubmit}>
                            <div className={`${styles.formNews_grid}`}>
                            <div className={`${styles.formNews_row_input}`}>
                                <input className={`${styles.defaultNews}`} id="email" type="email" name="email" placeholder="insira aqui seu melhor e-mail" onChange={handleChange} required="required" />
                                <input style={{display: show ? 'block' : 'block' }} className={`${styles.buttonNews}`} type="submit" value="Enviar" />
                            </div>

                            <div className={`${styles.formNews_row_check}`}>
                                <input  id="newsletter-checkbox-confirmation" name="newsletter-confirmation" type="checkbox" tabindex="0" value="" required="required" />
                                <label  for="newsletter-checkbox-confirmation">Eu aceito receber informações em meu e-mail</label>
                            </div>
                            </div>

                            <div style={{display: show ? 'block' : 'none' }} className={type ? `${styles.sucessBoxNews}` : `${styles.errorBoxNews}`}>{msg}</div>
                        </form>

                        <a href="/institucional/politica-de-privacidade" target="_blank" className={`${styles.politicaModalnews}`}>Confira nossa politica de privacidade</a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default popupNewsletter;