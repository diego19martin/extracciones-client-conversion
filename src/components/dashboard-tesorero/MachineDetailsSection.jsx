import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

/**
 * Componente para mostrar detalles de máquinas de una zona específica
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.zona - Datos de la zona seleccionada
 * @param {Array} props.machines - Lista de máquinas de la zona
 * @param {Boolean} props.loading - Indicador de carga
 * @param {String} props.error - Mensaje de error (si existe)
 * @param {Function} props.onBack - Función para volver a la vista de zonas
 * @param {Function} props.onConfirmZona - Función para confirmar la zona
 */
const MachineDetailsSection = ({
  zona,
  machines = [],
  loading = false,
  error = null,
  onBack,
  onConfirmZona
}) => {
  // Estados para paginación y búsqueda
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para datos procesados
  const [processedMachines, setProcessedMachines] = useState([]);
  const [machineSummary, setMachineSummary] = useState({
    total: 0,
    coincidentes: 0,
    discrepancia: 0,
    faltantes: 0,
    extra: 0
  });
  const [machineTotals, setMachineTotals] = useState({
    expectedAmount: 0,
    countedAmount: 0
  });

  // Procesar los datos de máquinas cuando se reciben
  useEffect(() => {
    if (Array.isArray(machines)) {
      // Procesar cada máquina para tener una estructura consistente
      const processed = machines.map(machine => processMachineData(machine));
      setProcessedMachines(processed);
      
      // Calcular resúmenes
      calculateSummary(processed);
      calculateTotals(processed);
    }
  }, [machines]);

  // Función para procesar los datos de una máquina
  const processMachineData = (machine) => {
    // Asegurarse de que los campos clave existan y tengan el formato correcto
    const machineId = machine.maquina || machine.machineId || '';
    const headercard = machine.headercard || '';
    const location = machine.location || '';
    
    // Convertir valores monetarios a números
    const expectedAmount = parseFloat(machine.valor_esperado || machine.expectedAmount || 0) || 0;
    const countedAmount = parseFloat(machine.valor_contado || machine.countedAmount || 0) || 0;
    const difference = countedAmount - expectedAmount;
    
    // Determinar estado
    let status = (machine.estado || machine.status || '').toLowerCase();
    
    if (!status || status === 'unknown') {
      // Determinar estado basado en la diferencia
      if (Math.abs(difference) < 0.01) {
        status = 'match';
      } else if (countedAmount === 0 && expectedAmount > 0) {
        status = 'missing';
      } else if (expectedAmount === 0 && countedAmount > 0) {
        status = 'extra';
      } else {
        status = 'mismatch';
      }
    }
    
    // Normalizar el estado a valores conocidos
    switch(status) {
      case 'match':
      case 'coincide':
        status = 'match';
        break;
      case 'mismatch':
      case 'no coincide':
      case 'discrepancia':
        status = 'mismatch';
        break;
      case 'missing':
      case 'faltante':
        status = 'missing';
        break;
      case 'extra':
        status = 'extra';
        break;
      default:
        // Mantener el valor original si no coincide con ninguno conocido
        break;
    }
    
    return {
      machineId,
      headercard,
      location,
      expectedAmount,
      countedAmount,
      difference,
      status
    };
  };

  // Función para calcular el resumen de máquinas
  const calculateSummary = (machines) => {
    const summary = {
      total: machines.length || 0,
      coincidentes: 0,
      discrepancia: 0,
      faltantes: 0,
      extra: 0
    };
    
    machines.forEach(machine => {
      const status = (machine.status || '').toLowerCase();
      
      if (status === 'match') {
        summary.coincidentes++;
      } else if (status === 'mismatch') {
        summary.discrepancia++;
      } else if (status === 'missing') {
        summary.faltantes++;
      } else if (status === 'extra') {
        summary.extra++;
      }
    });
    
    setMachineSummary(summary);
  };
  
  // Función para calcular totales
  const calculateTotals = (machines) => {
    const totals = machines.reduce((acc, machine) => {
      acc.expectedAmount += machine.expectedAmount;
      acc.countedAmount += machine.countedAmount;
      return acc;
    }, { expectedAmount: 0, countedAmount: 0 });
    
    setMachineTotals(totals);
  };
  
  // Si no hay zona seleccionada, mostrar mensaje
  if (!zona) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 300
        }}
      >
        <InfoIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Ninguna zona seleccionada
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Seleccione una zona para ver los detalles de sus máquinas.
        </Typography>
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            Volver a zonas
          </Button>
        )}
      </Paper>
    );
  }
  
  // Formatear valores monetarios
  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  // Filtrar máquinas según término de búsqueda
  const filteredMachines = processedMachines.filter(machine => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (machine.machineId && machine.machineId.toString().toLowerCase().includes(searchLower)) ||
      (machine.headercard && machine.headercard.toString().toLowerCase().includes(searchLower)) ||
      (machine.location && machine.location.toString().toLowerCase().includes(searchLower))
    );
  });
  
  // Aplicar paginación
  const paginatedMachines = filteredMachines.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Manejar cambio de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reiniciar página al cambiar búsqueda
  };
  
  // Renderizar chip de estado para una máquina
  const renderStatusChip = (status) => {
    if (!status) return null;
    
    switch (status) {
      case 'match':
        return <Chip 
          label="Coincide" 
          size="small" 
          color="success"
          icon={<CheckCircleIcon />}
        />;
      case 'mismatch':
        return <Chip 
          label="No coincide" 
          size="small" 
          color="error"
          icon={<ErrorIcon />}
        />;
      case 'missing':
        return <Chip 
          label="Faltante" 
          size="small" 
          color="warning"
          icon={<WarningIcon />}
        />;
      case 'extra':
        return <Chip 
          label="Extra" 
          size="small" 
          color="info"
          icon={<InfoIcon />}
        />;
      default:
        return <Chip 
          label={status} 
          size="small" 
          color="default"
        />;
    }
  };
  
  // Obtener color de fondo según el estado
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'match':
        return 'success.50';
      case 'mismatch':
        return 'error.50';
      case 'missing':
        return 'warning.50';
      case 'extra':
        return 'info.50';
      default:
        return 'inherit';
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Encabezado con información de la zona */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <IconButton 
              color="inherit" 
              onClick={onBack}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          
          <Typography variant="h6">
            Detalles de Zona {zona.zona}
          </Typography>
          
          {zona.confirmada ? (
            <Chip 
              label="Confirmada" 
              color="success" 
              size="small"
              icon={<CheckCircleIcon />}
              sx={{ ml: 2 }}
            />
          ) : (
            <Chip 
              label="Pendiente" 
              color="warning" 
              size="small"
              icon={<WarningIcon />}
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        {!zona.confirmada && onConfirmZona && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => onConfirmZona(zona)}
            sx={{ bgcolor: 'success.main' }}
          >
            Confirmar Zona
          </Button>
        )}
      </Box>
      
      {/* Resumen de la zona */}
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Resumen Financiero
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="medium">
                        {formatMoney(machineTotals.expectedAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Esperado
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="medium">
                        {formatMoney(machineTotals.countedAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Contado
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="medium"
                        color={(machineTotals.countedAmount - machineTotals.expectedAmount) >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatMoney(machineTotals.countedAmount - machineTotals.expectedAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Diferencia
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Resumen de Máquinas
                </Typography>
                
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="medium">
                        {machineSummary.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="medium" color="success.main">
                        {machineSummary.coincidentes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        OK
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="medium" color="error.main">
                        {machineSummary.discrepancia}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dif.
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="medium" color="warning.main">
                        {machineSummary.faltantes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Falt.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Divider />
      
      {/* Barra de herramientas */}
      <Box sx={{ 
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="subtitle1" component="h3">
          Detalle de Máquinas
        </Typography>
        
        <TextField
          placeholder="Buscar máquina..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
      </Box>
      
      {/* Tabla de máquinas */}
      <Box sx={{ position: 'relative' }}>
        {/* Estado de carga */}
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Mensaje de error */}
        {!loading && error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Sin datos */}
        {!loading && !error && filteredMachines.length === 0 && (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'grey.50'
          }}>
            <InfoIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              No hay máquinas disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 
                `No se encontraron máquinas que coincidan con "${searchTerm}".` :
                "No hay máquinas registradas para esta zona."}
            </Typography>
          </Box>
        )}
        
        {/* Tabla con datos */}
        {!loading && !error && filteredMachines.length > 0 && (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', minHeight: 200 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Máquina</TableCell>
                  <TableCell>Serie</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align="right">Esperado</TableCell>
                  <TableCell align="right">Contado</TableCell>
                  <TableCell align="right">Diferencia</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMachines.map((machine, index) => {
                  return (
                    <TableRow 
                      key={machine.machineId || index}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: getStatusBackgroundColor(machine.status)
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {machine.machineId || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {machine.headercard || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {machine.location || 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {formatMoney(machine.expectedAmount)}
                      </TableCell>
                      <TableCell align="right">
                        {formatMoney(machine.countedAmount)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: machine.difference === 0 ? 'inherit' :
                                  machine.difference > 0 ? 'success.main' : 
                                  'error.main',
                          fontWeight: machine.difference !== 0 ? 'bold' : 'inherit'
                        }}
                      >
                        {formatMoney(machine.difference)}
                      </TableCell>
                      <TableCell align="center">
                        {renderStatusChip(machine.status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Paginación */}
        {!loading && !error && filteredMachines.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredMachines.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        )}
      </Box>
    </Paper>
  );
};

export default MachineDetailsSection;