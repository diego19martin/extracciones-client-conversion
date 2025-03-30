import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU // Heroku en producción
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL // Vercel en producción
  : process.env.REACT_APP_HOST_LOCAL; // Localhost en desarrollo

const ConversionHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  
  useEffect(() => {
    fetchHistory();
  }, []);
  
  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_URL}/api/conversion/conversion-history`);
      
      if (response.data.success) {
        setHistory(response.data.history);
      } else {
        setError(response.data.message || 'Error al obtener el historial');
      }
    } catch (error) {
      console.error('Error fetching conversion history:', error);
      setError('Error al conectar con el servidor. Inténtelo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = async (comparison) => {
    setSelectedComparison(comparison);
    setDetailsOpen(true);
    setDetailsLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/conversion/conversion-details/${comparison.id}`);
      
      if (response.data.success) {
        setDetailsData(response.data);
      } else {
        setError(response.data.message || 'Error al obtener los detalles');
      }
    } catch (error) {
      console.error('Error fetching conversion details:', error);
      setError('Error al conectar con el servidor. Inténtelo más tarde.');
    } finally {
      setDetailsLoading(false);
    }
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetailsData(null);
  };
  
  const handleGenerateReport = async (comparisonId) => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/conversion/conversion-report/${comparisonId}`, {
        responseType: 'blob'
      });
      
      // Crear un URL para el blob y descargarlo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Conversion_${comparisonId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Error al generar el reporte. Inténtelo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewComparison = () => {
    navigate('/dashboard');
  };
  
  if (loading && history.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Historial de Conversiones
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNewComparison}
        >
          Nueva Comparación
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {history.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay registros de conversiones
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleNewComparison}
            sx={{ mt: 2 }}
          >
            Realizar primera comparación
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                {!isMobile && <TableCell>Archivos</TableCell>}
                <TableCell align="right">Esperado</TableCell>
                <TableCell align="right">Contado</TableCell>
                <TableCell align="right">Diferencia</TableCell>
                {!isMobile && (
                  <>
                    <TableCell align="center">OK / Error</TableCell>
                  </>
                )}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item) => {
                const difference = item.total_counted - item.total_expected;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {new Date(item.date_created).toLocaleString()}
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Typography variant="body2" component="div">
                          DAT: {item.dat_file_name}
                        </Typography>
                        <Typography variant="body2" component="div">
                          XLS: {item.xls_file_name}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      ${item.total_expected.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell align="right">
                      ${item.total_counted.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{
                        color: difference === 0 ? 'success.main' :
                              difference > 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {difference >= 0 ? '+' : ''}${difference.toLocaleString('es-AR')}
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Chip 
                            label={`${item.matching_machines} OK`} 
                            color="success" 
                            size="small" 
                            variant="outlined"
                          />
                          {(item.non_matching_machines > 0 || item.missing_machines > 0 || item.extra_machines > 0) && (
                            <Chip 
                              label={`${item.non_matching_machines + item.missing_machines + item.extra_machines} Error`} 
                              color="error" 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDetails(item)}
                        >
                          Detalles
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          onClick={() => handleGenerateReport(item.id)}
                        >
                          Reporte
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Diálogo de detalles */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de la Comparación
          {selectedComparison && (
            <Typography variant="subtitle2" color="text.secondary">
              {new Date(selectedComparison.date_created).toLocaleString()}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : detailsData ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Resumen
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: '1 1 200px' }}>
                  <Typography variant="body2" color="text.secondary">Total Esperado</Typography>
                  <Typography variant="h6">${detailsData.summary.total_expected.toLocaleString('es-AR')}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: '1 1 200px' }}>
                  <Typography variant="body2" color="text.secondary">Total Contado</Typography>
                  <Typography variant="h6">${detailsData.summary.total_counted.toLocaleString('es-AR')}</Typography>
                </Paper>
                <Paper sx={{ 
                  p: 2, 
                  flex: '1 1 200px',
                  bgcolor: detailsData.summary.total_counted - detailsData.summary.total_expected >= 0 ? 'success.light' : 'error.light'
                }}>
                  <Typography variant="body2" color="text.secondary">Diferencia</Typography>
                  <Typography variant="h6">
                    {detailsData.summary.total_counted - detailsData.summary.total_expected >= 0 ? '+' : ''}
                    ${(detailsData.summary.total_counted - detailsData.summary.total_expected).toLocaleString('es-AR')}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'success.light' }}>
                  <Typography variant="body2" color="text.secondary">Coincidentes</Typography>
                  <Typography variant="h6">{detailsData.summary.matching_machines}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'error.light' }}>
                  <Typography variant="body2" color="text.secondary">No Coincidentes</Typography>
                  <Typography variant="h6">{detailsData.summary.non_matching_machines}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'warning.light' }}>
                  <Typography variant="body2" color="text.secondary">Faltantes</Typography>
                  <Typography variant="h6">{detailsData.summary.missing_machines}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: '1 1 200px', bgcolor: 'info.light' }}>
                  <Typography variant="body2" color="text.secondary">Extra</Typography>
                  <Typography variant="h6">{detailsData.summary.extra_machines}</Typography>
                </Paper>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Detalles de Máquinas
              </Typography>
              
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Máquina</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell align="right">Esperado</TableCell>
                      <TableCell align="right">Contado</TableCell>
                      <TableCell align="right">Diferencia</TableCell>
                      <TableCell align="center">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailsData.details
                      .sort((a, b) => {
                        // Ordenar por estado: mismatch, missing, extra, match
                        const statusOrder = {
                          'mismatch': 0,
                          'missing': 1,
                          'extra': 2,
                          'match': 3
                        };
                        return statusOrder[a.status] - statusOrder[b.status];
                      })
                      .map((item) => (
                        <TableRow 
                          key={item.id}
                          sx={{
                            backgroundColor: 
                              item.status === 'match' ? '#e8f5e9' : 
                              item.status === 'mismatch' ? '#ffebee' : 
                              item.status === 'missing' ? '#fff8e1' : 
                              '#e0f7fa'
                          }}
                        >
                          <TableCell>{item.machine_id}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell align="right">${item.expected_amount.toLocaleString('es-AR')}</TableCell>
                          <TableCell align="right">${item.counted_amount.toLocaleString('es-AR')}</TableCell>
                          <TableCell align="right">
                            {item.difference >= 0 ? '+' : ''}
                            ${item.difference.toLocaleString('es-AR')}
                          </TableCell>
                          <TableCell align="center">
                            {item.status === 'match' && '✅ Coincide'}
                            {item.status === 'mismatch' && '❌ No coincide'}
                            {item.status === 'missing' && '⚠️ Faltante'}
                            {item.status === 'extra' && '➕ Extra'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Typography variant="body1" align="center">
              No hay datos disponibles.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Cerrar</Button>
          {selectedComparison && (
            <Button 
              color="secondary" 
              onClick={() => handleGenerateReport(selectedComparison.id)}
            >
              Generar Reporte
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversionHistory;