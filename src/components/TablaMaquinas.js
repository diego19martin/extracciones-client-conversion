import * as React from 'react';
import { useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2'

const TablaMaquinas = (props) => {

  var infoMaquinas=Object.values(props.info)
  console.log(infoMaquinas);

  var ext = Object.values(props.ext)
  console.log(ext);

  const [Extracciones, setExtracciones] = useState(['']);
  const [Select, setSelect] = useState(1);

  
  if(infoMaquinas.length > 1) {

    // console.log('mayor');

  const columns = [{
  dataField: 'maquina',
  text: 'Máquina'
  },
  {
    dataField: 'location',
    text: 'Location'
  }];

  var selectInfo = [];

const selectRow = {
  mode: 'checkbox',
  clickToSelect: true,
  bgColor: '#00BFFF',
  onSelect: (row, isSelect, rowIndex, e) => {
    console.log(row.maquina, isSelect);
    
    selectInfo.push({
      'maquina': row,
      'finalizado': isSelect,
      'asistente1': ext[0].value,
      'asistente2': ext[1].value
    })

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

if (Select === (infoMaquinas.length + 1)){
  Swal.fire({
    title: 'Pasar a próxima isla?',
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: 'Próxima isla',
    denyButtonText: `Quedarse`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Swal.fire('Ingresar número de la nueva isla', '', 'success');
      infoMaquinas=''
    } else if (result.isDenied) {
    }
  })
}

const emptyDataMessage = () => { return 'Sin datos para mostrar';}

  return (
  
    <BootstrapTable
      keyField='maquina'
      data={ infoMaquinas }
      columns={ columns }
      selectRow={ selectRow }
      noDataIndication={ emptyDataMessage }
    />

  );

  }
}

export default TablaMaquinas