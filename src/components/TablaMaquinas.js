import * as React from 'react';
import { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';

const TablaMaquinas = (props) => {

  var infoMaquinas=Object.values(props.info)
  // console.log(infoMaquinas);

  var ext = Object.values(props.ext)
  // console.log(ext);

  const [Extracciones, setExtracciones] = useState(['']);
  const [Select, setSelect] = useState(1);
  var [MaquinasExtraer, setMaquinasExtraer] = useState([''])

  useEffect(() => {

    setMaquinasExtraer(infoMaquinas)
    

  }, infoMaquinas)

  // console.log(MaquinasExtraer);

  if(infoMaquinas.length > 1) {

    // console.log('mayor');

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
    text: 'Extraida'
  }];

  var selectInfo = [];

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    bgColor: '#00BFFF',
    selected: [44],

  onSelect: (row, isSelect, rowIndex, e) => {

    Swal.fire({
      title: 'Seleccione:',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Completa',
      denyButtonText: `No realizada`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        // console.log('h');
      
      } else if (result.isDenied) {
        Swal.fire({
          title: 'Seleccione:',
          input: 'text'
      }).then((result) => {
        console.log(result.value);
      }) 
    }})



    console.log(row.maquina, isSelect, rowIndex);
    
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
   
    console.log(Select);

    // console.log(infoMaquinas);
   
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
      // console.log(MaquinasExtraer);
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
      
    />

  );

  }
}

export default TablaMaquinas