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

  console.log(Table);

  
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

    <h2 className="fecha">Fecha de lista cargada: {10}</h2>
    
    </div>
      <Range props={items}/>

      <div>
        <h3 className="restante">Maquinas restantes para finalizar extracción: {56}</h3>
        <h3 className="noPudo">No se puedieron extraer: {18}</h3>
      </div>

      

    </div>

    
  );
}

export default Conversion;