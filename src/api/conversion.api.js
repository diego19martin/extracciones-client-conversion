import axios from "axios";

const host = process.env.REACT_APP_HOST;

console.log(host);

export const postMaquinas = async(listado)=>{

    console.log(listado);

    await axios.post(`${host}/postMaquinas`, listado);
}

export const postConfig = async({ valuePesos }) => {
    console.log(valuePesos);
    await axios.post(`${host}/postConfig/${valuePesos}`);
}

export const getResumen = async () => {
    const res = await axios.get(`${host}/getResumen`);
    return res.data;
}


export const getInfo = async(maquina)=> {
    const res = await axios.get(`${host}/getInfo/${maquina}`);
    console.log(res);
    if(res===1){
        alert('no se encontro la maquina')
    
    }else{
    return res;
    }}
    

export const postSelect = async(selectInfo)=> {
    console.log(selectInfo);
    const res = await axios.post(`${host}/postSelect`, selectInfo );
    return res;
}

export const getTable = async()=> {
    const res = await axios.get(`${host}/getResumen`);
    return res;
}


