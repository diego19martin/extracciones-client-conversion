import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getTable, postMaquinas } from "../api/conversion.api";
import Range from "../components/Range.js"
import { Header } from "../components/Header";
import BootstrapTable from 'react-bootstrap-table-next';


function Conversion() {
  const [items, setItems] = useState([0]);
  const [Table, setTable] = useState([0]);

  useEffect(() => {
    

    let interval = setInterval(() => {
  
        async function info() {
        const respuesta = await getTable();
    
        setTable(respuesta.data)
        
      }
  
      info()
    }, 5000) 
  }, [])

 

  const rowStyle2 = (row, rowIndex) => {
    const style = {};
    // console.log(row);
    if (row.finalizado === 'Pendiente') {
      style.backgroundColor = 'rgb(188 188 188)';
    } else {
      style.backgroundColor = '#3aa674';
    }
  
    return style;
  };
  

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


  const columns = [{
    dataField: 'maquina',
    text: 'Máquina',
    headerStyle: {
      backgroundColor: '#8ec9ff'
    }
    },
    {
      dataField: 'location',
      text: 'Location',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'asistente1',
      text: 'Asistente 1',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'asistente2',
      text: 'Asistente 2',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'finalizado',
      text: 'Estado',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    }];

  const emptyDataMessage = () => { return 'Sin datos para mostrar';}

  var dia = new Date(Table[0].fecha)
  dia = dia.toLocaleDateString();

 
  return (
    <div className="conversion">
      <Header />
      <div className="inputFile">
      <input
        type="file"
        onChange={(e) => {
        const file = e.target.files[0];
        readExcel(file);
        }}
        className='botonInput'
      />

    <h2 className="fecha">Fecha de lista cargada: {dia}</h2>
    
    </div>
      <Range props={items}/>

      <div>
          <BootstrapTable
          keyField='maquina'
          data={ Table }
          columns={ columns }
          noDataIndication={ emptyDataMessage }
          rowStyle={ rowStyle2 }
        />
      </div>

    </div>

    
  );
}

export default Conversion;