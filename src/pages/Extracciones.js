import React from 'react'
import { Header } from '../components/Header'
import { useState } from 'react';
import Button from '@mui/material/Button';
import TablaMaquinas from '../components/TablaMaquinas';
import { getInfo } from '../api/conversion.api';
import Select from 'react-select'

export const Extracciones = () => {


  const [infoMaquinas, setInfoMaquinas] = useState([0])
  const [maquina, setMaquina] = useState('')

  // const [buttonClicked, setButtonClicked] = useState(false);

  var asistentes = [
    {value:'VARELA MARÍA', label: 'VARELA MARÍA'}, 
    {value:'ARREDONDO, PILAR', label:'ARREDONDO, PILAR'},
    {value:'BACCA, HERNAN HERBE', label: 'BACCA, HERNAN HERBE'},
    {value:'PERALTA JULIO', label:'PERALTA JULIO'},
    {value:'SILVA, NATALIA SOLEDAD', label:'SILVA, NATALIA SOLEDAD'},    
    ]

    var value=''


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

    const handleChangeSelect = (value) => {
        console.log(value);
    }
     

  return (
    <div className='container'>
      <Header />

      <form className='form-buscador'>

      <Select 
        isMulti
        className='select'
        placeholder='Seleccione Asistene 1'
        classNames={'basic-multi-select'}
        classNamePrefix="select"
        options = {asistentes}   
        onChange={handleChangeSelect}   
      />


        <div className='buscador'>  
          <label>Ingrese una máquina de la isla</label>
          <input type="number" value={maquina} onChange={handleChange}/>
        </div>
        
      </form>

      <Button className='buscar' variant="contained" color="success" onClick={buscar} style={{'margin':'30px'}}>
        Buscar
      </Button>
      
      
      <div>
        <TablaMaquinas info={infoMaquinas}/>
      </div>

    </div>
  )
}
