import axios from "axios";

const apiNews = axios.create({
  baseURL: "https://cloud.relacionamento.magicfeet.com.br/" 
});
 
export default apiNews;
