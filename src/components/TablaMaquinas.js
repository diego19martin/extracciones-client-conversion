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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Swal from 'sweetalert2';
import SimpleBarcodeScanner from './SimpleBarcodeScanner';
// Importar la función postSelect del API en lugar de usar axios directamente
import { postSelect } from '../api/conversion.api';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 440,
  marginTop: theme.spacing(2),
  padding: '16px'
}));

const StyledTableCell = styled(TableCell)({
  padding: '2px',
  fontSize: '1.4rem',
  textAlign: 'center',
});

const StyledTableRow = styled(TableRow)(({ theme, status }) => {
  let backgroundColor = 'inherit';

  if (status === 'Completa') {
    backgroundColor = '#e8f5e9'; // Verde claro
  } else if (status === 'Pendiente') {
    backgroundColor = '#ffe6e6'; // Rosa claro
  }

  return {
    backgroundColor,
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  
  // Estado para el escáner de headercard
  const [openScannerDialog, setOpenScannerDialog] = useState(false);
  const [headercard, setHeadercard] = useState('');

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
        setErrorMsg('Error al procesar los datos de máquinas');
        setShowError(true);
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
    
    // Si es una extracción completada, abrir el escáner de códigos
    if (isCompleted) {
      setOpenScannerDialog(true);
    } else {
      // Para extracciones pendientes, ir directamente al diálogo de motivo
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setExtractionStatus('');
    setComment('');
    setReason('');
    setHeadercard('');
  };

  // Manejar el código escaneado
  const handleScanComplete = (scannedValue, commentValue) => {
    setHeadercard(scannedValue);
    
    // Si se proporcionó un comentario desde el escáner, usarlo
    if (commentValue) {
      setComment(commentValue);
    }
    
    console.log('Headercard escaneada:', scannedValue);
    
    setOpenScannerDialog(false);
    
    // Si ya tenemos un comentario del escáner, podemos guardar directamente
    if (commentValue) {
      saveSelect(scannedValue, commentValue);
    } else {
      // De lo contrario, abrir diálogo para ingresar comentario
      setOpenDialog(true);
    }
  };

  const saveSelect = async (scannedHeadercard = null, scannedComment = null) => {
    if (!currentMachine) return;

    try {
      setLoading(true);
      console.log('Guardando máquina:', currentMachine);

      // Usar los valores escaneados si están disponibles, de lo contrario usar los del estado
      const finalHeadercard = scannedHeadercard || headercard;
      const finalComment = scannedComment || (extractionStatus === 'Completa' ? comment : reason);

      const selectInfo = {
        maquina: currentMachine.maquina,
        finalizado: extractionStatus,
        asistente1: ext[0]?.value || '',
        asistente2: ext[1]?.value || '',
        comentario: finalComment,
        fecha: currentMachine.fecha,
        zona: currentMachine.zona,
        headercard: finalHeadercard
      };
      
      console.log('Datos a enviar:', selectInfo);

      // Utilizar la función API en lugar de llamar directamente a axios
      // Esto asegura el uso de la URL correcta y los headers adecuados
      await postSelect(selectInfo);

      // Actualizar el estado de las máquinas con el nuevo estado
      const updatedMaquinas = maquinas.map((m) =>
        m.id === currentMachine.id ? { ...m, finalizado: extractionStatus, headercard: finalHeadercard } : m
      );
      setMaquinas(updatedMaquinas);

      handleCloseDialog();

      // Llamar a la función checkIslandCompletion con los estados actualizados
      checkIslandCompletion(updatedMaquinas);
      
      // Mostrar confirmación al usuario
      Swal.fire({
        icon: 'success',
        title: 'Extracción registrada',
        text: extractionStatus === 'Completa' 
          ? `Máquina ${currentMachine.maquina} extraída correctamente` +
            (finalHeadercard ? ` con headercard ${finalHeadercard}` : '')
          : `Máquina ${currentMachine.maquina} marcada como pendiente`,
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error al guardar la extracción:', error);
      setErrorMsg('Error al guardar la extracción: ' + (error.response?.data?.error || error.message));
      setShowError(true);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la extracción. Revise la conexión con el servidor.',
      });
    } finally {
      setLoading(false);
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

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
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

        {/* Diálogos para confirmar extracción */}
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

        {/* Diálogo para ingresar comentario o motivo */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{extractionStatus === 'Completa' ? 'Finalizar Extracción' : 'Extracción No Realizada'}</DialogTitle>
          <DialogContent>
            {extractionStatus === 'Completa' ? (
              <>
                {headercard && (
                  <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
                    Headercard escaneada: {headercard}
                  </Typography>
                )}
                <TextField
                  margin="normal"
                  label="Comentario"
                  fullWidth
                  multiline
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </>
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
            <Button 
              onClick={() => saveSelect()} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Componente del escáner de códigos de barras */}
        <SimpleBarcodeScanner
          open={openScannerDialog}
          onClose={() => setOpenScannerDialog(false)}
          onScan={handleScanComplete}
        />
      </Paper>
      
      {/* Snackbar para errores */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TablaMaquinas;