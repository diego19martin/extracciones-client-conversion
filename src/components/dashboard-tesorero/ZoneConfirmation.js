// components/ZoneConfirmation.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { formatCurrency } from '../../utils/formatUtils';
import axios from 'axios';
import { determineBaseUrl } from '../../utils/apiUtils';

const API_URL = determineBaseUrl();

const ZoneConfirmation = ({ zoneData, onConfirmationComplete }) => {
  const [confirmationState, setConfirmationState] = useState({
    isVerifying: false,
    isConfirming: false,
    verified: false,
    confirmed: false,
    comentarios: '',
    showDialog: false,
    dialogStep: 0, // 0: verificación, 1: confirmación
    showSuccessMessage: false
  });

  // Pasos del proceso de confirmación
  const confirmationSteps = ['Verificación de valores', 'Confirmación de recepción'];

  // Función para verificar los valores
  const handleVerify = () => {
    setConfirmationState(prev => ({
      ...prev,
      isVerifying: true
    }));

    // Simulación de verificación (en producción, esto sería una llamada a la API)
    setTimeout(() => {
      setConfirmationState(prev => ({
        ...prev,
        isVerifying: false,
        verified: true,
        showDialog: true,
        dialogStep: 0
      }));
    }, 1500);
  };

  // Función para confirmar la recepción de la zona
  const handleConfirm = () => {
    setConfirmationState(prev => ({
      ...prev,
      isConfirming: true,
      showDialog: false
    }));

    // Simulación de llamada a API para guardar en la tabla zona_conciliacion
    // En producción, sería una llamada real a la API
    setTimeout(async () => {
      try {
        // En producción, esta sería una llamada real a la API
        /*
        const response = await axios.post(`${API_URL}/api/tesorero/confirmar-zona`, {
          zona: zoneData.zona,
          fecha: new Date().toISOString(),
          usuario: 'argonz', // Idealmente, esto vendría de un contexto de autenticación
          confirmada: 1,
          total_esperado: zoneData.totalEsperado,
          total_contado: zoneData.totalContado,
          diferencia: zoneData.diferencia,
          maquinas_totales: zoneData.detalle.total,
          maquinas_coincidentes: zoneData.detalle.coinciden,
          maquinas_discrepancia: zoneData.detalle.difieren,
          maquinas_faltantes: zoneData.detalle.faltantes,
          maquinas_extra: zoneData.detalle.extra,
          comentarios: confirmationState.comentarios
        });
        */

        setConfirmationState(prev => ({
          ...prev,
          isConfirming: false,
          confirmed: true,
          showSuccessMessage: true
        }));

        // Notificar al componente padre que la confirmación está completa
        if (onConfirmationComplete) {
          onConfirmationComplete({
            zona: zoneData.zona,
            fecha: new Date().toISOString(),
            confirmada: true
          });
        }
      } catch (error) {
        console.error('Error al confirmar la zona:', error);
        setConfirmationState(prev => ({
          ...prev,
          isConfirming: false,
          error: 'Ocurrió un error al confirmar la zona. Por favor, intente nuevamente.'
        }));
      }
    }, 2000);
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setConfirmationState(prev => ({
      ...prev,
      showDialog: false
    }));
  };

  // Función para cerrar el mensaje de éxito
  const handleCloseSuccessMessage = () => {
    setConfirmationState(prev => ({
      ...prev,
      showSuccessMessage: false
    }));
  };

  // Manejar el cambio en los comentarios
  const handleComentariosChange = (e) => {
    setConfirmationState(prev => ({
      ...prev,
      comentarios: e.target.value
    }));
  };

  // Función para proceder al siguiente paso del diálogo
  const handleNextStep = () => {
    if (confirmationState.dialogStep === 0) {
      setConfirmationState(prev => ({
        ...prev,
        dialogStep: 1
      }));
    } else {
      handleConfirm();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '10px', mt: 3, position: 'relative' }}>
      {/* Indicador de zona confirmada */}
      {confirmationState.confirmed && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            m: 2,
            p: 1,
            bgcolor: 'success.light',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40,
            boxShadow: 2
          }}
        >
          <DoneAllIcon color="white" />
        </Box>
      )}

      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <VerifiedUserIcon sx={{ mr: 1 }} />
        Confirmación de Recepción - Zona {zoneData?.zona || '20'}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Verifique los valores y confirme la recepción del dinero para finalizar la gestión de esta zona.
      </Typography>

      <Stepper activeStep={confirmationState.confirmed ? 2 : confirmationState.verified ? 1 : 0} sx={{ mb: 3 }}>
        {confirmationSteps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Datos financieros */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#edf7ff', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Esperado
              </Typography>
              <Typography variant="h4" fontWeight="500">
                ${formatCurrency(zoneData?.totalEsperado || 15897860)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Según conteo inicial
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#f3f9ee', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Contado
              </Typography>
              <Typography variant="h4" fontWeight="500">
                ${formatCurrency(zoneData?.totalContado || 15199260)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dinero físico recibido
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: (zoneData?.diferencia || -698600) < 0 ? '#fee8e7' : '#e8f5e9',
            boxShadow: 1
          }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Diferencia
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="500"
                color={(zoneData?.diferencia || -698600) < 0 ? 'error.main' : 'success.main'}
              >
                ${formatCurrency(Math.abs(zoneData?.diferencia || -698600))}
              </Typography>
              <Typography 
                variant="body2" 
                color={(zoneData?.diferencia || -698600) < 0 ? 'error.main' : 'success.main'}
              >
                {(zoneData?.diferencia || -698600) < 0 
                  ? `${zoneData?.porcentaje || 4.39}% menos de lo esperado` 
                  : `${zoneData?.porcentaje || 0}% más de lo esperado`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de máquinas */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resumen de Máquinas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 1.5, 
                  bgcolor: '#e8f5e9', 
                  borderRadius: 1,
                  boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h5" fontWeight="500" color="success.main">
                    {zoneData?.detalle?.coinciden || 48}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coinciden
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 1.5, 
                  bgcolor: '#fff8e1', 
                  borderRadius: 1,
                  boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h5" fontWeight="500" color="warning.main">
                    {zoneData?.detalle?.difieren || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Difieren
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 1.5, 
                  bgcolor: '#fee8e7', 
                  borderRadius: 1,
                  boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h5" fontWeight="500" color="error.main">
                    {zoneData?.detalle?.faltantes || 9}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Faltantes
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 1.5, 
                  bgcolor: '#e3f2fd', 
                  borderRadius: 1,
                  boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h5" fontWeight="500" color="primary.main">
                    {zoneData?.detalle?.extra || 9}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Extra
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Comentarios y botones de acción */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Comentarios para la conciliación"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Ingrese cualquier observación relevante sobre la conciliación de esta zona"
              value={confirmationState.comentarios}
              onChange={handleComentariosChange}
              disabled={confirmationState.confirmed}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!confirmationState.verified && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={confirmationState.isVerifying ? <CircularProgress size={24} color="inherit" /> : <AttachMoneyIcon />}
                  onClick={handleVerify}
                  disabled={confirmationState.isVerifying || confirmationState.confirmed}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    boxShadow: 2
                  }}
                >
                  {confirmationState.isVerifying ? 'Verificando...' : 'Verificar Valores'}
                </Button>
              )}

              {confirmationState.verified && !confirmationState.confirmed && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={confirmationState.isConfirming ? <CircularProgress size={24} color="inherit" /> : <VerifiedUserIcon />}
                  onClick={() => setConfirmationState(prev => ({ ...prev, showDialog: true, dialogStep: 1 }))}
                  disabled={confirmationState.isConfirming || confirmationState.confirmed}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    boxShadow: 2
                  }}
                >
                  {confirmationState.isConfirming ? 'Confirmando...' : 'Confirmar Recepción'}
                </Button>
              )}

              {confirmationState.confirmed && (
                <Chip
                  label="Zona Confirmada"
                  color="success"
                  icon={<CheckCircleIcon />}
                  variant="outlined"
                  sx={{ fontSize: '1rem', py: 2, px: 1 }}
                />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Diálogo de verificación/confirmación */}
      <Dialog
        open={confirmationState.showDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmationState.dialogStep === 0 ? 'Verificación de Valores' : 'Confirmar Recepción de Zona'}
        </DialogTitle>
        <DialogContent>
          {confirmationState.dialogStep === 0 ? (
            <>
              <DialogContentText>
                Los valores han sido verificados correctamente. A continuación puede ver un resumen:
              </DialogContentText>
              <Box sx={{ mt: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Total Esperado:</strong> ${formatCurrency(zoneData?.totalEsperado || 15897860)}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Contado:</strong> ${formatCurrency(zoneData?.totalContado || 15199260)}
                </Typography>
                <Typography variant="body2" color={(zoneData?.diferencia || -698600) < 0 ? 'error.main' : 'success.main'}>
                  <strong>Diferencia:</strong> ${formatCurrency(Math.abs(zoneData?.diferencia || -698600))}
                  {(zoneData?.diferencia || -698600) < 0 ? ' (Faltante)' : ' (Exceso)'}
                </Typography>
              </Box>
              <DialogContentText sx={{ mt: 2 }}>
                ¿Los valores son correctos? Presione "Continuar" para proceder a la confirmación final.
              </DialogContentText>
            </>
          ) : (
            <>
              <DialogContentText>
                Está a punto de confirmar la recepción de dinero para la Zona {zoneData?.zona || '20'}.
                Esta acción registrará la confirmación en el sistema y cerrará el proceso de gestión de esta zona.
              </DialogContentText>
              <Alert severity="info" sx={{ mt: 2 }}>
                Al confirmar, usted está declarando que ha recibido y verificado físicamente el monto de ${formatCurrency(zoneData?.totalContado || 15199260)}.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleNextStep}>
            {confirmationState.dialogStep === 0 ? 'Continuar' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensaje de éxito */}
      <Snackbar
        open={confirmationState.showSuccessMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccessMessage} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Zona {zoneData?.zona || '20'} confirmada con éxito. La gestión ha sido finalizada.
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ZoneConfirmation;