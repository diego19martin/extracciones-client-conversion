import axios from "axios";

const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU
  : process.env.REACT_APP_HOST_LOCAL;


console.log(API_URL);

export const postMaquinas = async (listado) => {
    console.log(listado);
    await axios.post(`${API_URL}/api/postMaquinas`, listado);  // Asegúrate de que la ruta incluye '/api'
};

export const postConfig = async({ valuePesos, valueDolares }) => {
    console.log(valuePesos, valueDolares);
    
    await axios.post(`${API_URL}/api/postConfig`, { valuePesos, valueDolares });
}

export const getResumen = async () => {
    const res = await axios.get(`${API_URL}/api/getResumen`);
    return res.data;
}


export const getInfo = async(maquina)=> {
    
    console.log(maquina);
    
    const res = await axios.get(`${API_URL}/api/getInfo/${maquina}`);
    console.log(res);
    if(res===1){
        alert('no se encontro la maquina')
    
    }else{
    return res;
    }}
    

export const postSelect = async(selectInfo)=> {
    console.log(selectInfo);
    const res = await axios.post(`${API_URL}/api/postSelect`, selectInfo );
    return res;
}

export const getTable = async()=> {
    const res = await axios.get(`${API_URL}/api/getResumen`);
    return res;
}

export const postGenerateReport = async () => {
    return await axios.post(`${API_URL}/api/generarReporte`);
  };
  


