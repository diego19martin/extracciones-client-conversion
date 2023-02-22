import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getTable, postMaquinas } from "../api/conversion.api";
import Range from "../components/Range.js"
import { Header } from "../components/Header";
import BootstrapTable from 'react-bootstrap-table-next';


function Conversion() {
  const [items, setItems] = useState([0]);
  const [Table, setTable] = useState([0])

  useEffect(() => {

    let interval = setInterval(() => {
  
        async function info() {
        const respuesta = await getTable();
    
        setTable(respuesta.data)
        
      }
  
      info()
    }, 5000) 
  }, [])
  

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      // console.log(d);
      setItems(d);
    });
  };

  const handleClick = () => {

    postMaquinas(items);
   
  }   

  const columns = [{
    dataField: 'maquina',
    text: 'Máquina'
    },
    {
      dataField: 'location',
      text: 'Location'
    },{
      dataField: 'asistente1',
      text: 'Asistente 1'
    },{
      dataField: 'asistente2',
      text: 'Asistente 2'
    },{
      dataField: 'finalizado',
      text: 'Finalizada'
    }];

  const emptyDataMessage = () => { return 'Sin datos para mostrar';}

  return (
    <div className="container">
      <Header />
      <div className="inputFile">
      <input
        type="file"
        onChange={(e) => {
        const file = e.target.files[0];
        readExcel(file);
        }}
      />
      <button type="button" onClick={handleClick}>Cargar listado</button>
    </div>
      <Range props={items}/>

      <div>
          <BootstrapTable
          keyField='maquina'
          data={ Table }
          columns={ columns }
          noDataIndication={ emptyDataMessage }
        />
      </div>

    </div>

    
  );
}

export default Conversion;