import React, {useState}  from "react";
import api from "./services/api";
 
import style from "./styles.css"

function coreForm() {
    const [formData, updateFormData] = useState();
    const [formDataArchive, updateformDataArchive] = useState();
    const [selected, setSelected] = useState('')
    const [msg, setMsg] = useState();
    const [show, setShow] = useState(false);
    const [type, setType] = useState(false);

    const options = [
        {value: '', text: 'Selecione uma solicitação'},
        {value: 'Confirmar a existência de tratamento', text: 'Confirmar a existência de tratamento'},
        {value: 'Acesso aos dados', text: 'Acesso aos dados'},
        {value: 'Correção de dados incompletos, inexatos ou desatualizados', text: 'Correção de dados incompletos, inexatos ou desatualizados'},
        {value: 'Anonimização, bloqueio ou eliminação de dados', text: 'Anonimização, bloqueio ou eliminação de dados'},
        {value: 'Portabilidade dos dados a outro fornecedor de serviço ou produto', text: 'Portabilidade dos dados a outro fornecedor de serviço ou produto'},
        {value: 'Eliminação dos dados pessoais', text: 'Eliminação dos dados pessoais'},
        {value: 'Informação das entidades públicas e privadas com as quais os dados foram compartilhados', text: 'Informação das entidades públicas e privadas com as quais os dados foram compartilhados'},
        {value: 'Informação sobre a possibilidade de não fornecedor o consentimento e suas consequência', text: 'Informação sobre a possibilidade de não fornecedor o consentimento e suas consequência'},
        {value: 'Revogação do consentimento', text: 'Revogação do consentimento'},
        {value: 'Revisão de decisões tomadas com base no tratamento automatizado (perfil pessoal, profissional , de consumo, de crédito ou de aspectos de sua personalidade).', text: 'Revisão de decisões tomadas com base no tratamento automatizado (perfil pessoal, profissional , de consumo, de crédito ou de aspectos de sua personalidade).'},
      ];

    const handleChange = (e) => {
        updateFormData({
          ...formData,
          [e.target.name]: e.target.value.trim()
        });
      };

      const handleChangeSelect = (e) => {
        setSelected(e.target.value);

        updateFormData({
          ...formData,
          [e.target.name]: e.target.value.trim()
        });
      };
      

      const handleChangeFile = (e) => {
        updateformDataArchive({[e.target.name]: e.target.files[0]});
      };
    
    
      const handleSubmit = (e) => {
        e.preventDefault()

        console.log(formData)
        
        api.post("dataentities/FD/documents", formData)
        .then((response) => {
            document.getElementById("form-cad").reset();
 
            api.post(`dataentities/FD/documents/${response.data.DocumentId}/identidade/attachments/`, formDataArchive, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
            })

            setMsg('Sua solicitação foi recebida com sucesso, vamos atendê-la no prazo de 72horas.')
            setShow(true)
            setType(true)
        })
        .catch((err) => {
            const errType = err.response.data.Message

            if(errType == 'duplicated entry'){
                setMsg('Sua solicitação foi recebida com sucesso, vamos atendê-la no prazo de 72horas.')
                setShow(true)
                setType(false)
            }else{
                setMsg('Ops, parece que algo deu errado.')
                setShow(true)
                setType(false)
            }   
        });
      };
    
    return (
        <>
            <form id="form-cad" className={`${style.form}`} onSubmit={handleSubmit}>
                <label className={`${style.label}`}  for="tipoSolitacao">Tipo de solicitação:<span  className={`${style.required}`}>*</span></label>
                <select className={`${style.selectDireito}`}  name="tipoSolitacao"  id="tipoSolitacao" onChange={handleChangeSelect} required="required" value={selected}>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.text}
                        </option>
                    ))}
                </select>

                <label className={`${style.label}`}  for="nomeCompleto">Nome:<span  className={`${style.required}`}>*</span></label>
                <input className={`${style.default}`} id="nomeCompleto" type="text" name="nomeCompleto" placeholder="Nome" onChange={handleChange} required="required" />

                <label className={`${style.label}`} for="emailForm">Email<span className={`${style.required}`}>*</span></label>
                <input className={`${style.default}`} id="emailForm" type="email" name="emailForm" placeholder="Email" onChange={handleChange} required="required" />
 

                <span className={`${style.spanFile}`}>
                    Para concluir sua solicitação, ajude-nos a identificá-lo(a) em nosso sistema.<br />
                    Anexe o seu documento de identificação <b>(RG, CPF/MF, Carteira de Habilitação ou outro)</b> para confirmamos os seus dados <b>(apenas 1 imagem)</b>
                </span>
                <input className={`${style.labelArchive}`} type="file" class="documento" id="identidade" name="identidade" onChange={handleChangeFile} required="true" />

                <label className={`${style.label}`} for="comentario">Comentários<span className={`${style.required}`}>*</span></label>
                <textarea className={`${style.textareaDefault}`} name="comentario" id="comentario" cols="30" rows="10" class="comentario" onChange={handleChange}></textarea>
                
                <input style={{display: show ? 'none' : 'block' }} className={`${style.button}`} type="submit" value="Enviar" />
                <div style={{display: show ? 'block' : 'none' }} className={type ? `${style.sucessBox}` : `${style.errorBox}`}>{msg}</div>
            </form>
        </>
    );
}

export default coreForm;
 