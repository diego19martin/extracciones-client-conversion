import React from 'react'
import { Header } from '../components/Header'
import { useState } from 'react';
import Button from '@mui/material/Button';
import TablaMaquinas from '../components/TablaMaquinas';
import { getInfo } from '../api/conversion.api';
import Select from 'react-select';
import Swal from 'sweetalert2';


export const Extracciones = () => {


  const [infoMaquinas, setInfoMaquinas] = useState(['']);
  const [maquina, setMaquina] = useState('');
  const [extracciones, setExtracciones] = useState([])

  var asist = [];

  // const [buttonClicked, setButtonClicked] = useState(false);

  var asistentes = [
    { value: 'CRIADO MOLINA GABRIEL DARIO', label: 'CRIADO MOLINA GABRIEL DARIO' },
    { value: 'MADERA EMILIANO ', label: 'MADERA EMILIANO ' },
    { value: 'MARQUEZ GARCIA', label: 'MARQUEZ GARCIA' },
    { value: 'ABASTANTE MIGUEL ALBERTO', label: 'ABASTANTE MIGUEL ALBERTO' },
    { value: 'ORTEGA OMAR', label: 'ORTEGA OMAR' },
    { value: 'VACA PAULO', label: 'VACA PAULO' },
    { value: 'VILLACORTA NAHUEL', label: 'VILLACORTA NAHUEL' },
    { value: 'FARIAS KEVIN AXEL', label: 'FARIAS KEVIN AXEL' },
    { value: 'CAMINOS GUSTAVO', label: 'CAMINOS GUSTAVO' },
    { value: 'LEYES GABRIEL', label: 'LEYES GABRIEL' },
    { value: 'MUNICOY GUSTAVO', label: 'MUNICOY GUSTAVO' },
    { value: 'MARTINEZ ADAN DARIO', label: 'MARTINEZ ADAN DARIO' },
    { value: 'CARDOZO MAURICIO', label: 'CARDOZO MAURICIO' },
    { value: 'CASTILLO ROQUE', label: 'CASTILLO ROQUE' },
    { value: 'ROMAGNOLO GUSTAVO', label: 'ROMAGNOLO GUSTAVO' },
    { value: 'ALDAO CHRISTIAN DARIO', label: 'ALDAO CHRISTIAN DARIO' },
    { value: 'MONTOYA EMMANUEL', label: 'MONTOYA EMMANUEL' },
    { value: 'RODRIGUEZ HORACIO', label: 'RODRIGUEZ HORACIO' },
    { value: 'OCHOA SERGIO HERNAN', label: 'OCHOA SERGIO HERNAN' },
    { value: 'CAVEZZALI PABLO', label: 'CAVEZZALI PABLO' },
    { value: 'FAJARDO ROMÁN', label:'FAJARDO ROMÁN'},
    { value: 'ANTICIPADA', label:'ANTICIPADA'},
  ]

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
            placeholder='Seleccione Asistenes'
            classNames={'basic-multi-select'}
            classNamePrefix="select"
            options={asistentes}
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
