import React from 'react'
import { Header } from '../components/Header'
import { useState } from 'react';
import Button from '@mui/material/Button';
import TablaMaquinas from '../components/TablaMaquinas';
import { getInfo } from '../api/conversion.api';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import axios from 'axios';



export const Extracciones = () => {


  const [infoMaquinas, setInfoMaquinas] = useState(['']);
  const [maquina, setMaquina] = useState('');
  const [extracciones, setExtracciones] = useState([])

  var asist = [];

  // const [buttonClicked, setButtonClicked] = useState(false);

  const [empleados, setEmpleados] = useState([]);

useEffect(() => {
  const fetchEmpleados = async () => {
    try {
      const response = await axios.get('https://extraccione-server.herokuapp.com/employees');
      const empleadosData = response.data.map((emp) => ({
        value: emp.nombre,
        label: emp.nombre,
      }));
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
    }
  };

  fetchEmpleados();
}, []);


  
  const handleChange = event => {

    if (extracciones[1] !== undefined) {

      event.preventDefault();
      setMaquina(event.target.value);

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atención!',
        text: 'Debe seleccionar dos asistentes',
      })
    }

  }

  const buscar = () => {


    console.log('boton');
    // setMaquina(props.maq)

    async function findMachine() {

      const resp = await getInfo(maquina);

      console.log(resp.data);

      setInfoMaquinas(resp.data);

      setMaquina('');

    }
    findMachine();

  }

  const handleChangeSelect = (value) => {

    // console.log(value[1]);

    asist = [
      value[0],
      value[1]
    ]

    setExtracciones(asist);

    console.log(asist);

    console.log(asist.length);

  }


  return (
    <>
      <Header />
      <div className='container'>
        <form className='form-buscador'>

        <Select
          isMulti
          className='select'
          placeholder='Seleccione Asistentes'
          classNames={'basic-multi-select'}
          classNamePrefix="select"
          options={empleados}
          onChange={handleChangeSelect}
        />



          <div className='buscador'>
            <label>Ingrese una máquina de la isla</label>
            <input type="number" value={maquina} onChange={handleChange} />
          </div>

        </form>

        <Button className='buscar' variant="contained" color="success" onClick={buscar} style={{ 'margin': '30px' }}>
          Buscar
        </Button>


        <div>
          <TablaMaquinas info={infoMaquinas} ext={extracciones} />
        </div>

      </div>
    </>
  )
}

export default Extracciones;