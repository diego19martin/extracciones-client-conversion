import React from 'react'
import { Header } from '../components/Header'
import { useState } from 'react';
import { getInfo } from '../api/conversion.api';
import Button from '@mui/material/Button';



export const Extracciones = () => {

  const [maquina, setMaquina] = useState([]);

  const [infoMaquinas, setInfoMaquinas] = useState([0]);

  

  const handleChange = event => {

    setMaquina(event.target.value);
    
  }

  const buscar = () => {

    async function findMachine() {
      
      const resp = await getInfo(maquina);

      console.log(resp.data);

      setInfoMaquinas(resp.data);

    }
    findMachine();
     
  }


  return (
    <div className='container'>

      <form className='form-buscador'>

        <label>Ingrese una máquina de la isla</label>
        <input type="number" value={maquina} onChange={handleChange}/>
        
      </form>

      <Button className='buscar' variant="primary" onClick={buscar} >Buscar</Button>
      {/* <InfoMaquinas infoMaquina={infoMaquina} /> */}
      {/* <SelectGames /> */}
      
    </div>

  )
}
