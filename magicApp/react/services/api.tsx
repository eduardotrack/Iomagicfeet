import axios from "axios";

const api = axios.create({
  baseURL: "https://magicio--magicfeet.myvtex.com/api" 
});
 
export default api;
