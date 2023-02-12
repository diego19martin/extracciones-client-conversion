import React, { useState } from "react";
import * as XLSX from "xlsx";
import { postMaquinas } from "../api/conversion.api";
import Range from "../components/Range.js"
import { Header } from "../components/Header";


function Conversion() {
  const [items, setItems] = useState([0]);

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

    // console.log('hola');
    // console.log(items);
    postMaquinas(items);
   
  }   

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

    </div>
  );
}

export default Conversion;