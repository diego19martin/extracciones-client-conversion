import * as React from 'react';
import { useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { postSelect } from '../api/conversion.api';

const TablaMaquinas = (props) => {

  var infoMaquinas=Object.values(props.info)
  console.log(infoMaquinas);

  var ext = Object.values(props.ext)
  console.log(ext);

  const [Extracciones, setExtracciones] = useState([''])

  
  if(infoMaquinas.length > 1) {

    console.log('mayor');

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
    // console.log(row.maquina, isSelect);
    selectInfo.push({
      'maquina': row,
      'finalizado': isSelect,
      'asistente1': ext[0].value,
      'asistente2': ext[1].value
    })

    // console.log(selectInfo);

    setExtracciones(ext)
    postSelect(selectInfo);
    
  
  }
};

const emptyDataMessage = () => { return 'No Data to Display';}

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