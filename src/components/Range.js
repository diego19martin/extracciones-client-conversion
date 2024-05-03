import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { getTable, postConfig, postMaquinas } from '../api/conversion.api';
import Swal from 'sweetalert2';

function valuetext(value) {
  return `${value}°C`;
}

export default function Range(items) {
  const [value, setValue] = useState(0);
  const [Resumen, setResumen] = useState([]);
  const [cant, SetCant] = useState(0);
  const [Total, SetTotal] = useState(0);
  const [listadoFinal, setListadoFinal] = useState([]);
  const [listadoExtraer, setListadoExtraer] = useState([]);
  const [Restante, setRestante] = useState(0);
  const [NoPudo, setNoPudo] = useState(0);
  const [DineroEnStacker, setDineroEnStacker] = useState(0);
  const [fecha, setFecha] = useState('');

  const handleChange = (event, newValue) => {
    setResumen(items);
    setValue(newValue + 5000);
    var i = 0;
    var extraer = 0;
    var sumTotal = 0;
    let dineroEnStacker = 0;
    for (i = 0; i < Resumen.props.length; i++) {
      if (Resumen.props[i].bill >= value) {
        extraer++;
        sumTotal += Resumen.props[i].bill;
      } else {
        dineroEnStacker += Resumen.props[i].bill;
        console.log(Resumen.props[i].bill);
      }
    }
    SetCant(extraer);
    SetTotal(sumTotal);
    setDineroEnStacker(dineroEnStacker);
  }

  function handleClick() {
    postMaquinas(Resumen.props);
    let interval = setInterval(() => {
      async function infoFinal() {
        const resp = await getTable();
        setListadoExtraer(resp.data);
      }
      infoFinal();
    }, 5000);
    if (Resumen.props.length > 1) {
      postConfig(value);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Atención!',
        text: 'No hay archivo seleccionado',
      });
    }
  }

  useEffect(() => {
    var listadoFiltrado = [];
    var i = 0;

    for (i = 0; i < listadoExtraer.length; i++) {
      if (listadoExtraer[i].bill > value) {
        listadoFiltrado.push({
          'maquina': listadoExtraer[i].maquina,
          'location': listadoExtraer[i].location,
          'bill': listadoExtraer[i].bill,
          'fecha': listadoExtraer[i].fecha,
          'estado': listadoExtraer[i].finalizado,
          'asistente1': listadoExtraer[i].asistente1,
          'asistente2': listadoExtraer[i].asistente2,
          'comentario': listadoExtraer[i].comentario
        });
        setFecha(listadoExtraer[i].fecha);
      }
    }
    setListadoFinal(listadoFiltrado);
 
  }, [listadoExtraer, value]);


  const totalFormat = Total.toLocaleString('en-US');
  const totalStacker = DineroEnStacker.toLocaleString('en-US');

  return (
    <div className='infoContainer'>
      <div className='range' style={{ width: '100%' }}>
        <h3>Deslice para seleccionar límite de dinero a extraer por máquina</h3>
        <Box sx={{ width: '100%' }}>
          <Slider
            getAriaLabel={() => 'Temperature range'}
            value={value}
            onChange={handleChange}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            min={0}
            max={100000}
            step={5000}
          />
        </Box>
        <h3>Limite de dinero seleccionado $ {value.toLocaleString('en-US')}</h3>
      </div>

      <div className='info'>
        <h3>Cantidad de máquinas a extraer {cant}</h3>
        <h3>Dinero total a extraer $ {totalFormat}</h3>
        <h3>Dinero en stacker $ {totalStacker}</h3>
      </div>

      <Button className='but' variant="contained" color="success" onClick={handleClick} style={{ 'margin': '30px' }}>
        Confirmar configuración
      </Button>

      <div className='table-container'>

        <h2>Listado de Máquinas</h2>
        <table className='table'>
          <thead>
            <tr>
              <th>#</th>
              <th>Máquina</th>
              <th>Location</th>
              <th>Asistente 1</th>
              <th>Asistente 2</th>
              <th>Extracción</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {listadoFinal.map((item, index) => (
              <tr key={index} style={{ backgroundColor: item.estado === 'Completa' ? '#3aa674' : item.estado === 'Pendiente' ? 'red' : '' }}>
                <td>{index + 1}</td>
                <td>{item.maquina}</td>
                <td>{item.location}</td>
                <td>{item.asistente1}</td>
                <td>{item.asistente2}</td>
                <td>{item.estado}</td>
                <td>{item.comentario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <div>
        <h3 className="restante">Máquinas restantes para finalizar extracción: {Restante}</h3>
        <h3 className="noPudo">No se pudieron extraer: {NoPudo}</h3>
      </div> */}
    </div>
  );
}
