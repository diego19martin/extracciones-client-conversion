import React from 'react'
import { Header } from '../components/Header'
import { useState } from 'react';
import Button from '@mui/material/Button';
import TablaMaquinas from '../components/TablaMaquinas';
import { getInfo } from '../api/conversion.api';

export const Extracciones = () => {


  const [infoMaquinas, setInfoMaquinas] = useState([0])
  const [maquina, setMaquina] = useState('')

  // const [buttonClicked, setButtonClicked] = useState(false);


  const handleChange = event => {

    setMaquina(event.target.value);
    
  }

  const buscar = () => {

    console.log('boton');
    // setMaquina(props.maq)

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

      <Button className='buscar' variant="primary" onClick={buscar}>Buscar</Button>
      
      
      <div>
        <TablaMaquinas info={infoMaquinas}/>
      </div>

    </div>
  )
}
