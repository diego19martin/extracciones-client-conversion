// components/ZoneSummary.js
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Chip,
  Card,
  IconButton,
  Grid,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Collapse,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { formatCurrency } from '../../utils/formatUtils';
import axios from 'axios';

// Definir API_URL directamente para evitar problemas con imports
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_HOST_HEROKU 
  : process.env.REACT_APP_HOST_LOCAL;

console.log('Usando API_URL:', API_URL);

const ZoneSummary = () => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedZone, setExpandedZone] = useState(null);
  const [confirmingZone, setConfirmingZone] = useState(null);
  const [confirmationComment, setConfirmationComment] = useState('');
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showMachines, setShowMachines] = useState(false);
  const [selectedZoneMachines, setSelectedZoneMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  // Nuevo estado para manejar errores específicos
  const [error, setError] = useState(null);

  // Obtener el usuario actual (en un sistema real vendría de un context de autenticación)
  const currentUser = {
    username: 'tesorero',
    name: 'Usuario Tesorero',
    role: 'tesorero'
  };

  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    setLoading(true);
    setError(null); // Limpiar errores previos
    
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No se encontró token de autenticación');
        setError('No se encontró un token de autenticación válido. Por favor, inicie sesión nuevamente.');
        return;
      }
      
      // Intentar obtener datos con el token de autenticación
      const response = await axios.get(`${API_URL}/api/zonas-tesorero`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Respuesta de API:', response);
      
      // Verificar si la respuesta tiene datos en un formato válido
      if (response.data) {
        // Si es un array directamente
        if (Array.isArray(response.data)) {
          setZonas(response.data);
        } 
        // Si los datos están en una propiedad data
        else if (response.data.data && Array.isArray(response.data.data)) {
          setZonas(response.data.data);
        }
        // Si no tiene un formato reconocible
        else {
          console.error('Formato de respuesta no reconocido:', response.data);
          setError('La respuesta del servidor no tiene el formato esperado. Contacte al administrador.');
        }
      } else {
        setError('No se recibieron datos del servidor.');
      }
    } catch (error) {
      console.error('Error al cargar datos de zonas:', error);
      
      // Determinar mensaje de error específico según el tipo de error
      if (error.response) {
        // Error con respuesta del servidor
        if (error.response.status === 401) {
          setError('Su sesión ha expirado o no es válida. Por favor, inicie sesión nuevamente.');
        } else if (error.response.status === 403) {
          setError('No tiene permisos para acceder a esta información.');
        } else {
          setError(`Error del servidor: ${error.response.status}. ${error.response.data?.message || 'Intente nuevamente más tarde.'}`);
        }
      } else if (error.request) {
        // Error sin respuesta del servidor
        setError('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        // Error de configuración o inesperado
        setError(`Error inesperado: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExpandZone = (zoneId) => {
    setExpandedZone(expandedZone === zoneId ? null : zoneId);
  };

  const handleConfirmZone = (zone) => {
    setConfirmingZone(zone);
  };

  const handleConfirmationClose = () => {
    setConfirmingZone(null);
    setConfirmationComment('');
  };

  const handleConfirmationSubmit = async () => {
    if (!confirmingZone) return;
    
    setConfirmationLoading(true);
    
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      // Llamada a la API para confirmar la zona
      const response = await axios.post(`${API_URL}/api/confirmar-zona`, {
        zona_id: confirmingZone.id,
        usuario: currentUser.username,
        comentario: confirmationComment,
        fecha_confirmacion: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // Actualizar localmente la zona para mostrarla como confirmada
        const updatedZonas = zonas.map(z => 
          z.id === confirmingZone.id 
            ? {
                ...z, 
                confirmada: 1, 
                fecha_confirmacion: response.data.data?.fecha_confirmacion || new Date().toISOString(), 
                comentarios: confirmationComment,
                usuario_confirmacion: currentUser.username,
                estado_confirmacion: 'Confirmada'
              }
            : z
        );
        
        setZonas(updatedZonas);
        handleConfirmationClose();
        
        // Mostrar mensaje de éxito
        setSnackbarMessage(`Zona ${confirmingZone.zona} confirmada con éxito`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw new Error(response.data?.message || 'Error al confirmar la zona');
      }
    } catch (error) {
      console.error('Error al confirmar zona:', error);
      
      // Mostrar mensaje de error
      setSnackbarMessage(error.response?.data?.message || 'Error al confirmar la zona. Intente nuevamente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setConfirmationLoading(false);
    }
  };

  const handleViewMachines = async (zone) => {
    setMachinesLoading(true);
    setShowMachines(true);
    
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      try {
        // Intentar obtener máquinas reales de la API
        const response = await axios.get(`${API_URL}/api/zonas/${zone.id}/maquinas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Verificar formato de respuesta
        if (Array.isArray(response.data)) {
          setSelectedZoneMachines(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setSelectedZoneMachines(response.data.data);
        } else {
          throw new Error('Formato de respuesta no válido');
        }
      } catch (apiError) {
        console.warn('No se pudieron cargar datos reales de máquinas, usando datos de ejemplo:', apiError);
        
        // Para la demostración, usamos datos de ejemplo
        setTimeout(() => {
          const fakeMachines = [
            { maquina: '10000427', serie: 'SN001', esperado: 572000, contado: 0, diferencia: -572000, estado: 'Faltante' },
            { maquina: '8000731', serie: 'SN002', esperado: 292000, contado: 0, diferencia: -292000, estado: 'Faltante' },
            { maquina: '9001033', serie: 'SN003', esperado: 148300, contado: 148300, diferencia: 0, estado: 'Coincide' },
            { maquina: '8002406', serie: 'SN004', esperado: 818200, contado: 818200, diferencia: 0, estado: 'Coincide' },
            { maquina: '70000875', serie: 'SN005', esperado: 128000, contado: 128000, diferencia: 0, estado: 'Coincide' }
          ];
          setSelectedZoneMachines(fakeMachines);
        }, 800);
      }
    } catch (error) {
      console.error('Error general al cargar máquinas:', error);
      
      // Mostrar mensaje de error
      setSnackbarMessage('Error al cargar las máquinas de la zona');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setTimeout(() => {
        setMachinesLoading(false);
      }, 800);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCloseMachinesDialog = () => {
    setShowMachines(false);
    setSelectedZoneMachines([]);
  };

  const handleRetry = () => {
    fetchZonas();
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Cargando resumen de zonas...</Typography>
      </Paper>
    );
  }

  // Si hay un error, mostrar mensaje y botón para reintentar
  if (error) {
    return (
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          icon={<WarningAmberIcon fontSize="inherit" />}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Hubo un problema al cargar los datos
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRetry}
          startIcon={<KeyboardArrowUpIcon />}
        >
          Reintentar
        </Button>
      </Paper>
    );
  }

  if (!zonas || zonas.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
        <Typography variant="body1">No hay datos de zonas disponibles.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="500">
          Resumen por Zonas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Información financiera agrupada por zonas de máquinas
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width="5%"></TableCell>
              <TableCell>Zona</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Máquinas</TableCell>
              <TableCell align="right">Esperado ($)</TableCell>
              <TableCell align="right">Contado ($)</TableCell>
              <TableCell align="right">Diferencia ($)</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zonas.map((zona) => (
              <React.Fragment key={zona.id}>
                <TableRow 
                  hover 
                  sx={{ 
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    borderLeft: '4px solid',
                    borderLeftColor: zona.diferencia < 0 
                      ? 'error.main' 
                      : zona.diferencia > 0 
                        ? 'primary.main' 
                        : 'success.main',
                  }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandZone(zona.id)}
                    >
                      {expandedZone === zona.id ? 
                        <KeyboardArrowUpIcon /> : 
                        <KeyboardArrowDownIcon />
                      }
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {zona.maquinas_faltantes > 0 && (
                        <Box 
                          sx={{ 
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'error.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            mr: 1
                          }}
                        >
                          {zona.maquinas_faltantes}
                        </Box>
                      )}
                      {zona.zona}
                    </Box>
                  </TableCell>
                  <TableCell>{zona.fecha} {zona.hora}</TableCell>
                  <TableCell align="right">{zona.maquinas_totales}</TableCell>
                  <TableCell align="right">${formatCurrency(zona.total_esperado)}</TableCell>
                  <TableCell align="right">${formatCurrency(zona.total_contado)}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      color: zona.diferencia < 0 
                        ? 'error.main' 
                        : zona.diferencia > 0 
                          ? 'primary.main' 
                          : 'inherit'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      ${formatCurrency(Math.abs(zona.diferencia))}
                      {zona.diferencia < 0 && (
                        <ArrowDropDownIcon color="error" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={zona.confirmada === 1 ? "Confirmada" : "Pendiente"} 
                      color={zona.confirmada === 1 ? "success" : "default"}
                      size="small"
                      icon={zona.confirmada === 1 ? <CheckCircleIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    {zona.confirmada === 0 ? (
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<VerifiedUserIcon />}
                        onClick={() => handleConfirmZone(zona)}
                      >
                        Confirmar
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewMachines(zona)}
                      >
                        Detalles
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                
                {/* Fila de detalles expandibles */}
                {expandedZone === zona.id && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 0 }}>
                      <Collapse in={true} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                          <Grid container spacing={3}>
                            {/* Detalles de las máquinas */}
                            <Grid item xs={12} md={8}>
                              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Detalle de Máquinas
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                      <Typography variant="body2" color="text.secondary">Coincidentes</Typography>
                                      <Typography variant="h6" color="success.main">{zona.maquinas_coincidentes}</Typography>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                      <Typography variant="body2" color="text.secondary">Discrepancias</Typography>
                                      <Typography variant="h6" color="warning.main">{zona.maquinas_discrepancia}</Typography>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                      <Typography variant="body2" color="text.secondary">Faltantes</Typography>
                                      <Typography variant="h6" color="error.main">{zona.maquinas_faltantes}</Typography>
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                      <Typography variant="body2" color="text.secondary">Extra</Typography>
                                      <Typography variant="h6" color="primary.main">{zona.maquinas_extra}</Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                                
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => handleViewMachines(zona)}
                                  >
                                    Ver máquinas
                                  </Button>
                                </Box>
                              </Box>
                            </Grid>
                            
                            {/* Estado de confirmación */}
                            <Grid item xs={12} md={4}>
                              <Box sx={{ 
                                bgcolor: zona.confirmada === 1 ? 'success.light' : 'background.default', 
                                p: 2, 
                                borderRadius: '8px', 
                                border: '1px solid', 
                                borderColor: zona.confirmada === 1 ? 'success.main' : 'divider',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}>
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Estado de Confirmación
                                  </Typography>
                                  
                                  {zona.confirmada === 1 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                          Confirmada por: {zona.usuario_confirmacion || 'Usuario'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {zona.fecha_confirmacion ? new Date(zona.fecha_confirmacion).toLocaleString() : ''}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Pendiente de confirmación del tesorero
                                    </Typography>
                                  )}
                                  
                                  {zona.comentarios && (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Comentarios:
                                      </Typography>
                                      <Typography variant="body2">
                                        {zona.comentarios}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                  {zona.confirmada === 0 ? (
                                    <Button
                                      variant="contained"
                                      color="success"
                                      startIcon={<VerifiedUserIcon />}
                                      onClick={() => handleConfirmZone(zona)}
                                    >
                                      Confirmar Recepción
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      disabled
                                    >
                                      Confirmación Completa
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de confirmación */}
      <Dialog
        open={confirmingZone !== null}
        onClose={confirmationLoading ? undefined : handleConfirmationClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmar Recepción de Zona {confirmingZone?.zona}
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Está a punto de confirmar la recepción del dinero correspondiente a la Zona {confirmingZone?.zona}.
            Esta acción registrará que usted ha verificado y recibido el monto detallado a continuación.
          </DialogContentText>
          
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total Esperado:</Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${formatCurrency(confirmingZone?.total_esperado || 0)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total Contado:</Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${formatCurrency(confirmingZone?.total_contado || 0)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Diferencia:</Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  color={
                    (confirmingZone?.diferencia || 0) < 0 
                      ? 'error.main' 
                      : (confirmingZone?.diferencia || 0) > 0 
                        ? 'primary.main' 
                        : 'success.main'
                  }
                >
                  ${formatCurrency(Math.abs(confirmingZone?.diferencia || 0))}
                  {(confirmingZone?.diferencia || 0) < 0 ? ' (Faltante)' : (confirmingZone?.diferencia || 0) > 0 ? ' (Exceso)' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Al confirmar, está declarando que ha recibido y verificado el dinero físicamente.
          </Alert>
          
          <TextField
            label="Comentarios (opcional)"
            multiline
            rows={3}
            fullWidth
            value={confirmationComment}
            onChange={(e) => setConfirmationComment(e.target.value)}
            placeholder="Ingrese cualquier observación relevante sobre la recepción del dinero"
            disabled={confirmationLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleConfirmationClose} 
            disabled={confirmationLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleConfirmationSubmit}
            disabled={confirmationLoading}
            startIcon={confirmationLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {confirmationLoading ? 'Procesando...' : 'Confirmar Recepción'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para mostrar máquinas */}
      <Dialog
        open={showMachines}
        onClose={handleCloseMachinesDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalle de Máquinas
        </DialogTitle>
        <DialogContent>
          {machinesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Máquina</TableCell>
                    <TableCell>Serie</TableCell>
                    <TableCell align="right">Esperado ($)</TableCell>
                    <TableCell align="right">Contado ($)</TableCell>
                    <TableCell align="right">Diferencia ($)</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedZoneMachines.map((maquina, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        bgcolor: 
                          maquina.estado === 'Faltante' 
                            ? 'rgba(244, 67, 54, 0.08)' 
                            : maquina.estado === 'Exceso' 
                              ? 'rgba(25, 118, 210, 0.08)' 
                              : 'inherit'
                      }}
                    >
                      <TableCell>{maquina.maquina}</TableCell>
                      <TableCell>{maquina.serie}</TableCell>
                      <TableCell align="right">${formatCurrency(maquina.esperado)}</TableCell>
                      <TableCell align="right">${formatCurrency(maquina.contado)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: 
                            maquina.diferencia < 0 
                              ? 'error.main' 
                              : maquina.diferencia > 0 
                                ? 'primary.main' 
                                : 'inherit'
                        }}
                      >
                        ${formatCurrency(Math.abs(maquina.diferencia))}
                        {maquina.diferencia < 0 ? ' (-)' : maquina.diferencia > 0 ? ' (+)' : ''}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={maquina.estado} 
                          color={
                            maquina.estado === 'Faltante' 
                              ? 'error' 
                              : maquina.estado === 'Exceso' 
                                ? 'primary' 
                                : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMachinesDialog}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes de éxito/error */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ZoneSummary;