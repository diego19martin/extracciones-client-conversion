import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getTable, postMaquinas } from "../api/conversion.api.js";
import Range from "../components/Range.js";
import { Header } from "../components/Header.js";
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  padding: '8px 16px',
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  backgroundColor: 
    status === 'Completa' ? '#e8f5e9' : 
    status === 'Pendiente' ? '#fff3e0' : 
    'inherit',
}));

// Función para determinar la URL base de manera dinámica
const determineBaseUrl = () => {
  // Verificar si estamos en entorno de producción
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Obtener el hostname actual
  const currentHostname = window.location.hostname;
  
  // Opción 1: Estamos en producción (Heroku, Vercel, etc.)
  if (isProduction) {
    // Si estamos usando el mismo dominio para frontend y backend (con diferentes puertos/paths)
    // Usar la URL relativa al origen actual
    if (currentHostname.includes('extracciones-client-conversion')) {
      return 'https://extraccione-server.herokuapp.com';
    } else if (currentHostname.includes('vercel.app')) {
      return 'https://extracciones-client-conversion.vercel.app';
    }
    
    // Si no coincide con ninguno conocido, usar la API de Heroku por defecto
    return 'https://extraccione-server.herokuapp.com';
  }
  
  // Opción 2: Estamos en desarrollo local
  return 'http://localhost:4000';
};

// Determinar la URL base al iniciar
const API_URL = determineBaseUrl();

console.log('Inicializando API con URL:', API_URL);

  

function Conversion() {
  const [items, setItems] = useState([0]);
  const [table, setTable] = useState([]);
  
  useEffect(() => {

    const socket = io(API_URL); // Usar la URL adecuada

    // const socket = io('http://localhost:4000/'); 

    socket.on('tableUpdate', (updatedTable) => {
      setTable(updatedTable);
    });

    async function fetchInitialData() {
      try {
        const respuesta = await getTable();
        setTable(respuesta.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    }

    fetchInitialData();

    return () => {
      socket.disconnect();
    };
  }, []);

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
      setItems(d);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box className="conversion">
      <Box className="inputFile" sx={{ mb: 2 }}>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            readExcel(file);
          }}
          className='botonInput'
        />
        <Typography variant="h6" className="fecha">
          Fecha de lista cargada: {table[0]?.fecha ? formatDate(table[0].fecha) : 'N/A'}
        </Typography>
      </Box>

      <Range props={items} />

      <Link to="/employees">
        <Button variant="contained" color="primary" style={{ margin: '20px' }}>
          Gestión de Empleados
        </Button>
      </Link>
    </Box>
  );
}

export default Conversion;
