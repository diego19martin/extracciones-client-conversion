import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { postSelect } from '../api/conversion.api';
import Swal from 'sweetalert2';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 440,
  marginTop: theme.spacing(2),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  backgroundColor: status === 'Completa' ? '#e8f5e9' : status === 'Pendiente' ? '#fff3e0' : 'inherit',
}));

const TablaMaquinas = ({ info, ext }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [finishedRows, setFinishedRows] = useState([]);
  const [noFinishedRows, setNoFinishedRows] = useState([]);
  const [showTableBody, setShowTableBody] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [currentMachine, setCurrentMachine] = useState(null);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');

  const predefinedReasons = [
    'Llave limada',
    'Cerradura de Stacker Rota',
    'Bonus/Juegos gratis',
    'Puerta principal'
  ];

  useEffect(() => {
    if (Array.isArray(info)) {
      try {
        setMaquinas(info);
        setShowTableBody(true);
        const finished = info.filter(maquina => maquina.finalizado === 'Completa').map(maquina => maquina.id);
        setFinishedRows(finished);
        const notFinished = info.filter(maquina => maquina.finalizado === 'Pendiente').map(maquina => maquina.id);
        setNoFinishedRows(notFinished);
      } catch (error) {
        console.error('Error al obtener los datos de la sala:', error);
      }
    } else {
      console.error('La información recibida no es un array:', info);
    }
  }, [info]);

  const handleFinalizar = (maquina) => {
    if (!Array.isArray(ext) || ext.length !== 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar dos asistentes',
      });
      return;
    }
    setCurrentMachine(maquina);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDialogClose = () => {
    setOpenConfirmDialog(false);
  };

  const handleExtractionConfirm = (isCompleted) => {
    setOpenConfirmDialog(false);
    setExtractionStatus(isCompleted ? 'Completa' : 'Pendiente');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setExtractionStatus('');
    setComment('');
    setReason('');
  };

  const saveSelect = async () => {
    if (!currentMachine) return;
  
    try {
      console.log('currentmachine', currentMachine);
      
      const selectInfo = {
        maquina: currentMachine.maquina, // Extraer solo el número de la máquina
        finalizado: extractionStatus,
        asistente1: ext[0]?.value || '',
        asistente2: ext[1]?.value || '',
        comentario: extractionStatus === 'Completa' ? comment : reason,
        fecha: currentMachine.fecha, 
        zona: currentMachine.zona 
      };
      console.log(selectInfo);
      
      await postSelect(selectInfo);
  
      // Actualizar el estado de las máquinas con el nuevo estado
      const updatedMaquinas = maquinas.map(m =>
        m.id === currentMachine.id ? { ...m, finalizado: extractionStatus } : m
      );
      setMaquinas(updatedMaquinas);
  
      // Actualizar los registros finalizados y no finalizados
      if (extractionStatus === 'Completa') {
        setFinishedRows((prevFinishedRows) => [...prevFinishedRows, currentMachine.id]);
      } else {
        setNoFinishedRows((prevNoFinishedRows) => [...prevNoFinishedRows, currentMachine.id]);
      }
  
      handleCloseDialog();
  
      // Llamar a la función checkIslandCompletion con los estados actualizados
      checkIslandCompletion(updatedMaquinas, [...finishedRows, ...(extractionStatus === 'Completa' ? [currentMachine.id] : [])], [...noFinishedRows, ...(extractionStatus === 'Pendiente' ? [currentMachine.id] : [])]);
    } catch (error) {
      console.error('Error al guardar la extracción:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la extracción',
      });
    }
  };
  

  const checkIslandCompletion = (updatedMaquinas, updatedFinishedRows, updatedNoFinishedRows) => {
    // Verificar si se completaron todas las máquinas
    if (updatedFinishedRows.length + updatedNoFinishedRows.length >= updatedMaquinas.length) {
      Swal.fire({
        title: '¿Desea pasar a la siguiente isla?',
        showDenyButton: true,
        confirmButtonText: 'Sí',
        denyButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          resetTable();
        }
      });
    }
  };

  const resetTable = () => {
    setFinishedRows([]);
    setNoFinishedRows([]);
    setShowTableBody(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Extracciones en Sala
      </Typography>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Máquina</StyledTableCell>
              <StyledTableCell>Location</StyledTableCell>
              <StyledTableCell>Zona</StyledTableCell>
              <StyledTableCell>Estado</StyledTableCell>
              <StyledTableCell>Acción</StyledTableCell>
            </TableRow>
          </TableHead>
          {showTableBody && (
            <TableBody>
              {Array.isArray(maquinas) && maquinas.length > 0 ? (
                maquinas.map((maquina, index) => (
                  <StyledTableRow key={index} status={maquina.finalizado}>
                    <TableCell>{maquina.maquina}</TableCell>
                    <TableCell>{maquina.location}</TableCell>
                    <TableCell>{maquina.zona}</TableCell>
                    <TableCell>
                      <Chip
                        label={maquina.finalizado || 'No iniciado'}
                        color={maquina.finalizado === 'Completa' ? 'success' : 
                               maquina.finalizado === 'Pendiente' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleFinalizar(maquina)}
                      >
                        Finalizar
                      </Button>
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    No hay datos disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </StyledTableContainer>

      {/* Dialogs for confirming extraction */}
      <Dialog open={openConfirmDialog} onClose={handleConfirmDialogClose}>
        <DialogTitle>Confirmar Extracción</DialogTitle>
        <DialogContent>
          <Typography>¿Cómo desea finalizar esta extracción?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleExtractionConfirm(true)} color="primary">
            Finalizar
          </Button>
          <Button onClick={() => handleExtractionConfirm(false)} color="secondary">
            No Realizada
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {extractionStatus === 'Completa' ? 'Finalizar Extracción' : 'Extracción No Realizada'}
        </DialogTitle>
        <DialogContent>
          {extractionStatus === 'Completa' ? (
            <TextField
              margin="normal"
              label="Comentario"
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel>Motivo</InputLabel>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {predefinedReasons.map((reason, index) => (
                  <MenuItem key={index} value={reason}>{reason}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={saveSelect} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TablaMaquinas;
