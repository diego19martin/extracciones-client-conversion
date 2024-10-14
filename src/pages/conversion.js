import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getTable, postMaquinas } from "../api/conversion.api";
import Range from "../components/Range.js"
import { Header } from "../components/Header";
import io from 'socket.io-client';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
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

function Conversion() {
  const [items, setItems] = useState([0]);
  const [table, setTable] = useState([]);
  
  useEffect(() => {
    const socket = io('http://localhost:4000'); // Make sure this matches your backend port

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

      <Range props={items}/>

      {/* <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Máquina</StyledTableCell>
              <StyledTableCell>Location</StyledTableCell>
              <StyledTableCell>Asistente 1</StyledTableCell>
              <StyledTableCell>Asistente 2</StyledTableCell>
              <StyledTableCell>Extracción</StyledTableCell>
              <StyledTableCell>Comentario</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {table.map((row, index) => (
              <StyledTableRow key={index} status={row.finalizado}>
                <TableCell>{row.maquina}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.asistente1 || '-'}</TableCell>
                <TableCell>{row.asistente2 || '-'}</TableCell>
                <TableCell>{row.finalizado || 'No iniciado'}</TableCell>
                <TableCell>{row.comentario || '-'}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
    </Box>
  );
}

export default Conversion;