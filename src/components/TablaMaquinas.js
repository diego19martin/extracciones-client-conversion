import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

export default function TablaMaquinas(infoMaquinas) {

  infoMaquinas=Object.values(infoMaquinas.info)
  console.log(infoMaquinas);

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

const selectRow = {
  mode: 'checkbox',
  clickToSelect: true,
  bgColor: '#00BFFF',
  onSelect: (row, isSelect, rowIndex, e) => {
    console.log(row.maquina, isSelect);
  }
};

const emptyDataMessage = () => { return 'No Data to Display';}

// console.log(infoMaquinas.length);

// if(infoMaquinas.length===1)
//   return null;


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