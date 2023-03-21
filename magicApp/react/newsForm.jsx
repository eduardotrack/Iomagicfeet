import React, {useState}  from "react";
import api from "./services/apiNews";
 
import style from "./styles.css"

function newsForm() {
    const [formData, updateFormData] = useState();
 
    const [msg, setMsg] = useState('Obrigado! Fique de olho no e-mail, você receberá ótimas novidades por lá.');
    const [show, setShow] = useState(false);
    const [type, setType] = useState(false);

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
            <p  className={`${style.formNews_title}`}>Fique por dentro de todos os</p>
            <h2  className={`${style.formNews_subtitle}`}>Lançamentos <strong>e Novidades</strong></h2>

            <form id="form-news" className={`${style.formNews}`} onSubmit={handleSubmit}> 
                
                <div className={`${style.formNews_grid}`}>
                  <div className={`${style.formNews_row_input}`}>
                      <input className={`${style.defaultNews}`} id="email" type="email" name="email" placeholder="insira aqui seu melhor e-mail" onChange={handleChange} required="required" />
                      <input style={{display: show ? 'block' : 'block' }} className={`${style.buttonNews}`} type="submit" value="Enviar" />
                  </div>

                  <div className={`${style.formNews_row_check}`}>
                    <input  id="newsletter-checkbox-confirmation" name="newsletter-confirmation" type="checkbox" tabindex="0" value="" required="required" />
                    <label  for="newsletter-checkbox-confirmation">Eu aceito receber informações em meu e-mail</label>
                  </div>  
                </div>

                <div style={{display: show ? 'block' : 'none' }} className={type ? `${style.sucessBoxNews}` : `${style.errorBoxNews}`}>{msg}</div>
            </form>
        </>
    );
}

export default newsForm;
 