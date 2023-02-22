import axios from "axios";

const host = process.env.REACT_APP_HOST;

// console.log(host);

export const postMaquinas = async(listado)=>{

    // console.log(listado);

    await axios.post(`${host}/postMaquinas`, listado);
}

export const postConfig = async(configuracion)=>{
    await axios.post(`${host}/postConfig/${configuracion}`);
}

export const getResumen = async()=>{
    await axios.get(`${host}/getResumen`); 
}

export const getInfo = async(maquina)=> {
    const res = await axios.get(`${host}/getInfo/${maquina}`);
    return res;
}

export const postSelect = async(selectInfo)=> {
    console.log(selectInfo);
    const res = await axios.post(`${host}/postSelect`, selectInfo );
    return res;
}

export const getTable = async()=> {
    const res = await axios.get(`${host}/getResumen`);
    return res;
}


