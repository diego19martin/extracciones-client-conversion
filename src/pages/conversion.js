import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { getTable, postMaquinas, getUltimaCarga } from "../api/conversion.api";
import Range from "../components/Range.js";
import { Header } from "../components/Header";
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
  Button,
  Alert
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

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU  // Heroku en producción
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL  // Vercel en producción
  : process.env.REACT_APP_HOST_LOCAL;  // Local en desarrollo

  console.log(API_URL);
  

// Convierte el listado guardado en el servidor al formato que usa la pantalla
const listadoAItems = (filas) =>
  (Array.isArray(filas) ? filas : [])
    .filter((f) => f && f.maquina && String(f.maquina) !== '0')
    .map((f) => ({
      machine: f.maquina,
      location: f.location,
      bill: parseFloat(f.bill) || 0,
      zona: f.zona,
      moneda: f.moneda,
    }));

const formatFechaHora = (valor) => {
  if (!valor) return '';
  const d = new Date(valor);
  return isNaN(d) ? '' : d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
};

function Conversion() {
  const [items, setItems] = useState([0]);
  const [table, setTable] = useState([]);
  const [ultimaCarga, setUltimaCarga] = useState(null);
  const [archivoManual, setArchivoManual] = useState(false);

  // Trae el listado vigente (cargado automáticamente o a mano) y su origen
  const cargarListadoVigente = useCallback(async (reemplazarItems) => {
    try {
      const respuesta = await getTable();
      setTable(respuesta.data);
      if (reemplazarItems) {
        const vigentes = listadoAItems(respuesta.data);
        if (vigentes.length > 0) setItems(vigentes);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
    try {
      setUltimaCarga(await getUltimaCarga());
    } catch (error) {
      console.error('Error al obtener la última carga:', error);
    }
  }, []);

  useEffect(() => {
    cargarListadoVigente(true);
  }, [cargarListadoVigente]);

  useEffect(() => {
    const socket = io(API_URL); // Usar la URL adecuada

    socket.on('tableUpdate', (updatedTable) => {
      setTable(updatedTable);
    });

    // Llegó un listado nuevo (ej. carga automática del mail de Tesorería).
    // Si el usuario está trabajando con un archivo cargado a mano, no se lo pisamos.
    socket.on('listadoCargado', (info) => {
      if (info && info.origen === 'manual') {
        // Se confirmó una carga manual: ese archivo pasa a ser el listado vigente
        setArchivoManual(false);
        cargarListadoVigente(true);
      } else {
        cargarListadoVigente(!archivoManual);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [cargarListadoVigente, archivoManual]);

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
      setArchivoManual(true);
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
      <Header />
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

      {ultimaCarga && (
        <Alert
          severity={ultimaCarga.origen === 'automatica' ? 'info' : 'success'}
          sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}
        >
          <strong>
            Última carga: {ultimaCarga.origen === 'automatica' ? 'automática (mail "Archivo para App")' : 'manual'}
          </strong>{' '}
          — {formatFechaHora(ultimaCarga.fecha)} · {Number(ultimaCarga.maquinas).toLocaleString('es-AR')} máquinas ·{' '}
          {Number(ultimaCarga.a_extraer).toLocaleString('es-AR')} a extraer con límite $
          {Number(ultimaCarga.limite).toLocaleString('es-AR')}.
          {archivoManual
            ? ' Estás viendo el archivo que cargaste a mano: confirmá la configuración para reemplazar el listado.'
            : ' Podés ajustar el límite y confirmar, o cargar otro archivo a mano.'}
        </Alert>
      )}

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
