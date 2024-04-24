import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getTable, postMaquinas } from "../api/conversion.api";
import Range from "../components/Range.js"
import { Header } from "../components/Header";



function Conversion() {

  const [items, setItems] = useState([0]);
  const [Table, setTable] = useState([{maquina: 1, fecha: '01/01/1990'}]);
  
  useEffect(() => {
    
    let interval = setInterval(() => {
  
        async function info() {
        const respuesta = await getTable();
    
        setTable(respuesta.data)

        // console.log(respuesta.data);

      }
  
      info()
    }, 5000) 
  }, [])

  // console.log(Table);

  
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

  if(Table[0].fecha !== undefined){
    var dia = new Date(Table[0].fecha)
    dia = dia.toLocaleDateString();
    
    }

  console.log(items);


  
 
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

    </div>

    
  );
}

export default Conversion;