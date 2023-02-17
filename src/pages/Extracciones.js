import React from 'react'
import { Header } from '../components/Header'
import { useState } from 'react';
import Button from '@mui/material/Button';
import TablaMaquinas from '../components/TablaMaquinas';



export const Extracciones = () => {

  const [maquina, setMaquina] = useState([]);

  const [buttonClicked, setButtonClicked] = useState(false);


  const handleChange = event => {

    setMaquina(event.target.value);
    
  }

  const buscar = () => {

    setButtonClicked(true)
     
  }


  return (
    <div className='container'>

      <form className='form-buscador'>

        <label>Ingrese una máquina de la isla</label>
        <input type="number" value={maquina} onChange={handleChange}/>
        
      </form>

      <Button className='buscar' variant="primary" onClick={buscar} >Buscar</Button>
      
      
      <div>
        {buttonClicked ? <TablaMaquinas maq={maquina}/> : null}
        
      </div>

    </div>
  )
}
