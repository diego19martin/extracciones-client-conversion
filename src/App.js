import React from 'react'
import { Route, Routes } from "react-router-dom";
import Conversion from './pages/conversion.js';
import Extracciones from './pages/Extracciones.js';
import GestionEmpleados from './pages/Empleados.js';


export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/conversion" element={<Conversion />} />
        <Route path="/extracciones" element={<Extracciones />} />
        <Route path="/employees" element={<GestionEmpleados />} />
      </Routes>
    </>
  )
}

export default App