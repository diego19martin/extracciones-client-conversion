import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { getInfo, postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';

const TablaMaquinas = (props) => {
  const { info, ext } = props;

  const [selectedRows, setSelectedRows] = useState([]);
  const [finishedRows, setFinishedRows] = useState([]);
  const [noFinishedRows, setNoFinishedRows] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [selectInfo, setSelectInfo] = useState([]);
  const [select, setSelect] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInfo(info);
        const data = response.data;
        console.log(info, data);
  
        // Verificar si data es un array antes de usar filter()
        if (Array.isArray(data)) {
          const finished = data.filter(maquina => maquina.finalizado === 'Completa').map(maquina => maquina.id);
          const notFinished = data.filter(maquina => maquina.finalizado === 'Pendiente').map(maquina => maquina.id);

          setMaquinas(data);
          setFinishedRows(finished);
          setNoFinishedRows(notFinished);
        } else {
          console.error('El objeto recibido no es un array:', data);
        }
      } catch (error) {
        console.error('Error al obtener los datos de la sala:', error);
      }
    };
  
    if (Object.values(info).length > 0) {
      fetchData();
    }
  }, [info]);

  // console.log(finishedRows, noFinishedRows);
  

  

  const handleRowClick = (row) => {
    const finishedIndex = finishedRows.indexOf(row.id);
    const notFinishedIndex = noFinishedRows.indexOf(row.id);
    let newFinished = [...finishedRows];
    let newNotFinished = [...noFinishedRows];

    // Si la máquina está en la lista de filas finalizadas, quitarla de esa lista
    // y agregarla a la lista de filas no finalizadas
    if (finishedIndex !== -1) {
        newFinished = newFinished.filter(id => id !== row.id);
        if (notFinishedIndex === -1) {
            newNotFinished.push(row.id);
        }
    } else {
        // Si la máquina no está en la lista de filas finalizadas,
        // agregarla a esa lista y quitarla de la lista de filas no finalizadas
        newFinished.push(row.id);
        if (notFinishedIndex !== -1) {
            newNotFinished = newNotFinished.filter(id => id !== row.id);
        }
    }

    setSelectedRows([...newFinished, ...newNotFinished]);
    setFinishedRows(newFinished);
    setNoFinishedRows(newNotFinished);
};

  
  const handleFinalizar = async (row) => {
    // Verificar si se han seleccionado exactamente dos asistentes
    if (ext.length !== 2) {
        // Mostrar alerta indicando que se deben seleccionar dos asistentes
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe seleccionar dos asistentes',
        });
        return; // Detener la ejecución de la función
    }

    const result = await Swal.fire({
        title: 'Seleccione una opción de extracción:',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Completa',
        denyButtonText: `No realizada`,
        allowOutsideClick: false, // Evita que el modal se cierre al hacer clic fuera de él
    });

  if (result.isConfirmed) {
      const comentario = await Swal.fire({
          title: 'Novedad de la máquina',
          input: 'text',
          allowOutsideClick: false, // Evita que el modal se cierre al hacer clic fuera de él
      });

      if (comentario.isConfirmed) {
          await saveSelect(row, true, comentario.value); // Pasando los tres parámetros
      }
  } else if (result.isDenied) {
      const motivo = await Swal.fire({
          title: 'Motivo',
          input: 'select',
          inputOptions: {
              'Llave limada': 'Llave limada',
              'Cerradura de Stacker Rota': 'Cerradura de Stacker Rota',
              'Bonus/Juegos gratis': 'Bonus/Juegos gratis',
              'Puerta principal': 'Puerta principal'
          },
          inputPlaceholder: 'Seleccione un motivo',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false, // Evita que el modal se cierre al hacer clic fuera de él
          inputValidator: (value) => {
              if (!value) {
                  return 'Debe seleccionar un motivo';
              }
          }
      });

      if (motivo.isConfirmed) {
          await saveSelect(row, false, motivo.value); // Pasando los tres parámetros
      }
  }
};

const saveSelect = async (row, finalizado, comentario) => {
  console.log(row, finalizado, comentario);
  getRowStyle(row);
  const selectInfo = {
      maquina: row,
      finalizado: finalizado ? 'Completa' : 'Pendiente',
      asistente1: ext[0].value,
      asistente2: ext[1].value,
      comentario: comentario
  };
  console.log(selectInfo);
  await postSelect(selectInfo);

  if (finalizado) {
      setFinishedRows([...finishedRows, row.id]);
  } else {
      // setFinishedRows(finishedRows.filter(id => id !== row.id));
      setNoFinishedRows([...noFinishedRows, row.id]);
  }
};

const getRowStyle = (maquina) => {
  // console.log(maquina);
  let backgroundColor = '#ffffff'; // Color por defecto

  // Si la máquina está en la lista de máquinas finalizadas, marcarla de verde
  if (finishedRows.includes(maquina.id)) {
      backgroundColor = '#3aa674'; // Color verde
      console.log('verde');
      // console.log(maquina.id, 'finished');
  } else if (noFinishedRows.includes(maquina.id)) {
      // Si la máquina está en la lista de máquinas pendientes, marcarla de otro color (por ejemplo, amarillo)
      backgroundColor = '#ffeb3b'; // Color amarillo
      // console.log(maquina.id, 'not finished');
      console.log('amarillo');
  } else {
      // Si la máquina no está en ninguna de las listas, aplicar estilo de alternancia de color
      backgroundColor = maquina.id % 2 === 0 ? '#f0f0f0' : '#ffffff';
      // console.log(maquina.id, 'not in any list');
  }

  return { backgroundColor };
};


  return (
    <>
      <h2>Extracciones en Sala</h2>
      <TableContainer>
        <Table>
          <TableHead style={{ backgroundColor: '#54c7f4' }}>
            <TableRow>
              <TableCell>Máquina</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(info).map((maquina, index) => (
              <TableRow
                key={index}
                onClick={() => handleRowClick(maquina)}
                style={getRowStyle(maquina)}
              >
                <TableCell style={{ fontSize: '10px' }}>{maquina.maquina}</TableCell>
                <TableCell style={{ fontSize: '10px' }}>{maquina.location}</TableCell>
                <TableCell style={{ fontSize: '10px' }}>{maquina.zona}</TableCell>
                <TableCell>
                  <Button onClick={() => handleFinalizar(maquina)} style={{ fontSize: '10px' }}>Finalizar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TablaMaquinas;
