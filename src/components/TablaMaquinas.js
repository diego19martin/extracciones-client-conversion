import * as React from 'react';
import { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';

const TablaMaquinas = (props) => {

  
  console.log(props);
  
  var infoMaquinas=Object.values(props.info)
  // console.log(infoMaquinas);

  var ext = Object.values(props.ext)
  // console.log(ext);

  

  const [Extracciones, setExtracciones] = useState(['']);
  const [Select, setSelect] = useState(1);
  var [MaquinasExtraer, setMaquinasExtraer] = useState(['']);
  const [SelectedAyrray, setSelectedAyrray] = useState('')

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
  text: 'Máquina'
  },
  {
    dataField: 'location',
    text: 'Location'
  },
  {
    dataField: 'finalizado',
    text: 'Extracción'
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

  return (
  
    <BootstrapTable
      keyField= 'id'
      data={ MaquinasExtraer }
      columns={ columns }
      selectRow={ selectRow }
      noDataIndication={ emptyDataMessage }
      rowClasses={'rowClass'}
      headerClasses={'headerclass'}
      
    />

  );

  }
}

export default TablaMaquinas