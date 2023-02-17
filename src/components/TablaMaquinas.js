import * as React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { useState, useEffect, useRef } from 'react';
import { getInfo } from '../api/conversion.api';


export default function TablaMaquinas(props) {


  const [infoMaquinas, setInfoMaquinas] = useState([])
  const [maquina, setMaquina] = useState()


  // console.log(props.maq);

    useEffect(() => {

      let ignore = false;

      console.log(ignore);

      setMaquina(props.maq)

      async function findMachine() {
      
        const resp = await getInfo(props.maq);
  
        console.log(resp.data);

        if (!ignore){

          setInfoMaquinas(resp.data);

        }
  
      }
      findMachine();

      return () => {
        ignore = true;
      }

    }, [])
    
  // var infoMaquina = Object.values(infoMaquinas)

  const data = [{
    'maquina': 123456,
    'location': 454646,
    'id': 45
  },{
    'maquina': 545444,
    'location': 788745,
    'id': 48
  }]

  // infoMaquinas = Array();

  // console.log(data);
  // console.log(infoMaquinas);

  const columns = [{
  dataField: 'maquina',
  text: 'Máquina'
  },
  {
    dataField: 'location',
    text: 'Location'
  },
  {
    dataField: 'id',
    text: 'Id'
  }];

const selectRow = {
  mode: 'checkbox',
  clickToSelect: true,
  bgColor: '#00BFFF'
};

const emptyDataMessage = () => { return 'No Data to Display';}

// console.log(infoMaquinas.length);

// if(infoMaquinas.length===1)
//   return null;


  return (
  
    <BootstrapTable
      keyField='id'
      data={ infoMaquinas }
      columns={ columns }
      selectRow={ selectRow }
      noDataIndication={ emptyDataMessage }
    />

  );
}