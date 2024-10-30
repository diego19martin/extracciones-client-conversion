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
  padding: '16px'
}));


const StyledTableCell = styled(TableCell)({
  padding: '2px', // Aumentar el relleno para darle más espacio a cada celda
  fontSize: '1.4rem', // Aumentar el tamaño de la fuente
  textAlign: 'center', // Centrar el texto en cada celda
});


const StyledTableRow = styled(TableRow)(({ theme, status }) => {
  let backgroundColor = 'inherit';

  if (status === 'Completa') {
    backgroundColor = '#e8f5e9'; // Verde claro
  } else if (status === 'Pendiente') {
    backgroundColor = '#ffe6e6'; // Rosa claro
  }

  return {
    backgroundColor, // Asignar el color basado en el estado de la máquina
  };
});


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
    'Puerta principal',
  ];

  useEffect(() => {
    if (Array.isArray(info)) {
      try {
        setMaquinas(info);
        setShowTableBody(true);
        const finished = info.filter((maquina) => maquina.finalizado === 'Completa').map((maquina) => maquina.id);
        setFinishedRows(finished);
        const notFinished = info.filter((maquina) => maquina.finalizado === 'Pendiente').map((maquina) => maquina.id);
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
        zona: currentMachine.zona,
      };
      console.log(selectInfo);

      await postSelect(selectInfo);

      // Actualizar el estado de las máquinas con el nuevo estado
      const updatedMaquinas = maquinas.map((m) =>
        m.id === currentMachine.id ? { ...m, finalizado: extractionStatus } : m
      );
      setMaquinas(updatedMaquinas);

      handleCloseDialog();

      // Llamar a la función checkIslandCompletion con los estados actualizados
      checkIslandCompletion(updatedMaquinas);
    } catch (error) {
      console.error('Error al guardar la extracción:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la extracción',
      });
    }
  };

  const checkIslandCompletion = (updatedMaquinas) => {
    // Verificar si se completaron todas las máquinas
    if (updatedMaquinas.every((maquina) => maquina.finalizado === 'Completa' || maquina.finalizado === 'Pendiente')) {
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
    <Paper
      elevation={3}
      sx={{
        p: 1, // Ajusta el padding para reducirlo. Un valor de 1 o 2 será menor que el actual (que parece ser alrededor de 3).
        width: '100%', // Ajusta el ancho para ocupar más espacio de la pantalla.
        maxWidth: '100%', // Permite ocupar el ancho total del contenedor.
        margin: '0 auto', // Centra horizontalmente el componente en la pantalla.

      }}
    >
      <Typography variant="h5" gutterBottom>
        Extracciones en Sala
      </Typography>
      <StyledTableContainer component={Paper}>
        <Table sx={{ minWidth: '100%' }}>
          <TableHead>
          <TableRow>
            <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Máquina</TableCell>
            <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Location</TableCell>
            <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Zona</TableCell>
            <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Acción</TableCell>
          </TableRow>
          </TableHead>
          {showTableBody && (
            <TableBody>
              {Array.isArray(maquinas) && maquinas.length > 0 ? (
                maquinas.map((maquina, index) => (
                  <StyledTableRow key={index} status={maquina.finalizado}>
                    <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '1.2rem' }}>{maquina.maquina}</TableCell>
                    <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '0.9rem' }}>{maquina.location}</TableCell>
                    <TableCell style={{padding: '5px', textAlign: 'center'}} sx={{ fontSize: '0.9rem' }}>{maquina.zona}</TableCell>
                    <TableCell style={{width: '5px', padding: '5px', fontSize: '10px', textAlign: 'center'}}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleFinalizar(maquina)}
                        style={{width: '5px', padding: '5px', fontSize: '10px', textAlign: 'center'}}
                      >
                        Finalizar
                      </Button>
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>No hay datos disponibles.</TableCell>
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
        <DialogTitle>{extractionStatus === 'Completa' ? 'Finalizar Extracción' : 'Extracción No Realizada'}</DialogTitle>
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
              <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                {predefinedReasons.map((reason, index) => (
                  <MenuItem key={index} value={reason}>
                    {reason}
                  </MenuItem>
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
