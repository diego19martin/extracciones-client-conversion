import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { getInfo, postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';

const TablaMaquinas = (props) => {
  const { info, ext } = props;

  const [selectedRows, setSelectedRows] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [finishedRows, setFinishedRows] = useState([]);
  const [noFinishedRows, setNoFinishedRows] = useState([]);
  const [cont, setCont] = useState(0);
  const [showTableBody, setShowTableBody] = useState(true); // Nuevo estado para controlar la visibilidad del cuerpo de la tabla

  useEffect(() => {
    try {
      console.log(props.info);
      setMaquinas(props.info);
      setShowTableBody(true); 
      const maquinasData = props.info;
      const selected = maquinasData.filter(maquina => maquina.finalizado === 'Completa').map(maquina => maquina.id);
      setSelectedRows(selected);
      const finished = maquinasData.filter(maquina => maquina.finalizado === 'Completa').map(maquina => maquina.id);
      setFinishedRows(finished);
      const notFinished = maquinasData.filter(maquina => maquina.finalizado === 'Pendiente').map(maquina => maquina.id);
      setNoFinishedRows(notFinished);
    } catch (error) {
      console.error('Error al obtener los datos de la sala:', error);
    }
  }, [props.info]);

  const handleRowClick = (row) => {
    const selectedIndex = selectedRows.indexOf(row.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, row.id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const handleFinalizar = async (row) => {
    if (ext.length !== 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar dos asistentes',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Seleccione una opción de extracción:',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Completa',
      denyButtonText: `No realizada`,
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      const comentario = await Swal.fire({
        title: 'Novedad de la máquina',
        input: 'text',
        allowOutsideClick: false,
      });

      if (comentario.isConfirmed) {
        await saveSelect(row, true, comentario.value);
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
        allowOutsideClick: false,
        inputValidator: (value) => {
          if (!value) {
            return 'Debe seleccionar un motivo';
          }
        }
      });

      if (motivo.isConfirmed) {
        await saveSelect(row, false, motivo.value);
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
    setCont(cont + 1);
    if (finalizado) {
      setFinishedRows([...finishedRows, row.id]);
    } else {
      // setFinishedRows(finishedRows.filter(id => id !== row.id));
      setNoFinishedRows([...noFinishedRows, row.id]);
    }
    checkIslandCompletion();
  };

  const checkIslandCompletion = () => {
    console.log(finishedRows.length, noFinishedRows.length, maquinas.length);
    if (finishedRows.length + noFinishedRows.length >= (maquinas.length-1)) {
      console.log('Island completed');
      Swal.fire({
        title: '¿Desea pasar a la siguiente isla?',
        showDenyButton: true,
        confirmButtonText: 'Sí',
        denyButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          // Reiniciar la tabla para la siguiente isla
          resetTable();
        }
      });
    }
  };

  const resetTable = () => {
    // Limpiar los estados y ocultar el cuerpo de la tabla
    setSelectedRows([]);
    setFinishedRows([]);
    setNoFinishedRows([]);
    setCont(0);
    setShowTableBody(false); // Ocultar el cuerpo de la tabla
  };

  const getRowStyle = (maquina) => {
    let backgroundColor = '#ffffff'; // Color por defecto

    if (finishedRows.includes(maquina.id)) {
      backgroundColor = '#3aa674'; // Color verde
    } else if (noFinishedRows.includes(maquina.id)) {
      backgroundColor = '#ffeb3b'; // Color amarillo
    } else {
      backgroundColor = maquina.id % 2 === 0 ? '#f0f0f0' : '#ffffff'; // Alternancia de colores
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
          {showTableBody && ( // Mostrar el cuerpo de la tabla solo si showTableBody es true
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
          )}
        </Table>
      </TableContainer>
    </>
  );
};

export default TablaMaquinas;
