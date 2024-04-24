import * as React from 'react';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';

const TablaMaquinas = (props) => {

  
  console.log(props);
  
  var infoMaquinas=Object.values(props.info)
  console.log(infoMaquinas);

  var ext = Object.values(props.ext)
  // console.log(ext);

  

  const [Extracciones, setExtracciones] = useState(['']);
  const [Select, setSelect] = useState(1);
  var [MaquinasExtraer, setMaquinasExtraer] = useState(['']);
  const [SelectedAyrray, setSelectedAyrray] = useState('')

  const [selectedRows, setSelectedRows] = useState([]);
  const [finishedRows, setFinishedRows] = useState([]);
  const [noFinishedRows, setNoFinishedRows] = useState([]);
  const [restantes, setRestantes] = useState(0);
  const [sala, setSala] = useState('');
  const [cont, setCont] = useState(0);
  const [maquinas, setMaquinas] = useState([]);

  useEffect(() => {

      setMaquinasExtraer(infoMaquinas)

      var i = 0;
  
      var selArray =[];

      for(i=0; i < infoMaquinas.length; i++) {
        if(infoMaquinas[i].finalizado==='Completa'){
          selArray.push(infoMaquinas[i].id);
        }
      }

      // console.log(selArray);

      setSelectedAyrray(selArray)
      console.log(SelectedAyrray);
    
  }, infoMaquinas)

  console.log(MaquinasExtraer);

  if(infoMaquinas.length >= 1) {

  console.log(SelectedAyrray);
  const columns = [{
  dataField: 'maquina',
  text: 'Máquina',
  headerStyle: { backgroundColor: '#e342e6', color: 'white' },
  },
  {
    dataField: 'location',
    text: 'Location',
    headerStyle: { backgroundColor: '#e342e6', color: 'white' },
  },
  {
    dataField: 'zona',
    text: 'Zona',
    headerStyle: { backgroundColor: '#e342e6', color: 'white' },
  },
  {
    dataField: 'finalizado',
    text: 'Extracción',
    headerStyle: { backgroundColor: '#e342e6', color: 'white' },
  }];

  var selectInfo = [];

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    bgColor: '#00BFFF',
    selected: SelectedAyrray ,

  onSelect: (row, isSelect, rowIndex, e) => {


    // Crear un elemento <select> personalizado
    const selectElement = document.createElement('select');
    selectElement.innerHTML = `
      <option value="Llave limada">Llave limada</option>
      <option value="Cerradura de Stacker Rota">Cerradura de Stacker Rota</option>
      <option value="Bonus/Juegos gratis">Bonus/Juegos gratis</option>
      <option value="Puerta principal">Puerta principal</option>
    `;

    console.log(row, e);


    setSelectedAyrray('');

    if(isSelect===true){

      Swal.fire({
        title: 'Seleccione una opción de extracción:',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Completa',
        denyButtonText: `No realizada`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {

          // console.log(row.finalizado);
          // row.finalizado = 'Completo';
          // console.log(row.finalizado);

          Swal.fire({
            title: 'Novedad de la máquina',
            input: 'text'
        }).then((result) => {

          selectInfo.push({
            'maquina': row,
            'finalizado': isSelect,
            'asistente1': ext[0].value,
            'asistente2': ext[1].value,
            'comentario': result.value
          });
      
          setExtracciones(ext)
          postSelect(selectInfo);
      
          if(isSelect){
          setSelect(Select + 1)
          } else {
            setSelect(Select - 1)
          }
         
          // console.log(Select);
      
          // console.log(infoMaquinas);
        })
         
        } else if (result.isDenied) {
          Swal.fire({
            title: 'Motivo',
            html: selectElement.outerHTML
        }).then((result) => {

          console.log(selectElement.value);

          // console.log(result.value);


          selectInfo.push({
            'maquina': row,
            'finalizado': 'No Disponible',
            'asistente1': ext[0].value,
            'asistente2': ext[1].value,
            'comentario': selectElement.value
          });
      
          setExtracciones(ext)
          postSelect(selectInfo);

          console.log(selectInfo);
      
          if(isSelect){
          setSelect(Select + 1)
          } else {
            setSelect(Select - 1)
          }
         
          // console.log(Select);

        }) 
      } else {
        selectInfo.push({
            'maquina': row,
            'finalizado': isSelect,
            'asistente1': ext[0].value,
            'asistente2': ext[1].value
          });
      
          setExtracciones(ext)
          postSelect(selectInfo);
      
          if(isSelect){
          setSelect(Select + 1)
          } else {
            setSelect(Select - 1)
          }
 
      }
    
    })
    } else {
      selectInfo.push({
        'maquina': row,
        'finalizado': isSelect,
        'asistente1': ext[0].value,
        'asistente2': ext[1].value
      });
  
      setExtracciones(ext)
      postSelect(selectInfo);
  
      if(isSelect){
      setSelect(Select + 1)
      } else {
        setSelect(Select - 1)
      }
    }
    // console.log(row.maquina, isSelect, rowIndex); 
  }  
};

if (Select === (MaquinasExtraer.length + 1)){

  Swal.fire({
    title: 'Pasar a próxima isla?',
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: 'Próxima isla',
    denyButtonText: `Quedarse`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Swal.fire('Ingresar número de la siguiente isla', '', 'success');
      MaquinasExtraer=[];
      MaquinasExtraer=[{
         id:'1'
      }
      ];
      setMaquinasExtraer(MaquinasExtraer)
      setSelect(1);
      console.log(MaquinasExtraer);
    } else if (result.isDenied) {
    }
    
  })
}

// console.log(infoMaquinas);
console.log(MaquinasExtraer);


const emptyDataMessage = () => { return 'Sin datos para mostrar';}


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
  });

  if (result.isConfirmed) {
      const comentario = await Swal.fire({
          title: 'Novedad de la máquina',
          input: 'text'
      });

      if (comentario.isConfirmed) {
          await saveSelect(row, true, comentario.value); // Pasando los tres parámetros
          setFinishedRows([...finishedRows, row.id]); // Agregar el ID de la máquina a finishedRows
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
          inputValidator: (value) => {
              if (!value) {
                  return 'Debe seleccionar un motivo';
              }
          }
      });

      if (motivo.isConfirmed) {
          await saveSelect(row, false, motivo.value); // Pasando los tres parámetros
          setNoFinishedRows([...noFinishedRows, row.id]); // Agregar el ID de la máquina a noFinishedRows
      }
  }
};

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
};


const getRowStyle = (maquina) => {
  // console.log(maquina);
  let backgroundColor = '#ffffff'; // Color por defecto

  // Si la máquina está en la lista de máquinas finalizadas, marcarla de verde
  if (finishedRows.includes(maquina.id)) {
      backgroundColor = '#3aa674'; // Color verde
      // console.log(maquina.id, 'finished');
  } else if (noFinishedRows.includes(maquina.id)) {
      // Si la máquina está en la lista de máquinas pendientes, marcarla de otro color (por ejemplo, amarillo)
      backgroundColor = '#ffeb3b'; // Color amarillo
      // console.log(maquina.id, 'not finished');
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
                <TableHead style={{backgroundColor: '#54c7f4'}}>
                    <TableRow>
                        <TableCell>Máquina</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Zona</TableCell>
                        <TableCell>Acción</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {MaquinasExtraer.map((maquina, index) => (
                        <TableRow 
                        key={index} 
                        onClick={() => handleRowClick(maquina)} 
                        style={getRowStyle(maquina)}
                    >
                        <TableCell style={{fontSize: '10px'}}>{maquina.maquina}</TableCell>
                        <TableCell style={{fontSize: '10px'}}>{maquina.location}</TableCell>
                        <TableCell style={{fontSize: '10px'}}>{maquina.zona}</TableCell>
                        <TableCell>
                            <Button onClick={() => handleFinalizar(maquina)} style={{fontSize: '10px'}}>Finalizar</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>

  );

  }
}

export default TablaMaquinas