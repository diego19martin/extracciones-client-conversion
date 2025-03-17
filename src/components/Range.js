import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Slider, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { postConfig, postGenerateReport, postMaquinas, postGenerateDailyReport } from '../api/conversion.api';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import axios from 'axios';

function valuetext(value) {
  return `${value}°C`;
}

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU // Heroku en producción
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL // Vercel en producción
  : process.env.REACT_APP_HOST_LOCAL; // Localhost en desarrollo

export default function Range({ props }) {
  // Estados originales
  const [valuePesos, setValuePesos] = useState(0);
  const [valueDolares, setValueDolares] = useState(1);
  const [resumen, setResumen] = useState([]);
  const [cant, setCant] = useState(0);
  const [total, setTotal] = useState(0);
  const [listadoFinal, setListadoFinal] = useState([]);
  const [dineroEnStacker, setDineroEnStacker] = useState(0);
  const [cantDolares, setCantDolares] = useState(0);
  const [totalDolares, setTotalDolares] = useState(0);
  const [dineroEnStackerDolares, setDineroEnStackerDolares] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Nuevos estados para paginación y filtrado
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState('No iniciado'); // Por defecto mostrar las no iniciadas
  const [itemsPerPage] = useState(20);

  // Calcular conteos para el resumen
  const conteos = useMemo(() => {
    if (!listadoFinal || listadoFinal.length === 0) return { completadas: 0, pendientes: 0, noIniciadas: 0, total: 0 };
    
    const completadas = listadoFinal.filter(item => item.finalizado === 'Completa').length;
    const pendientes = listadoFinal.filter(item => item.finalizado === 'Pendiente').length;
    const noIniciadas = listadoFinal.filter(item => !item.finalizado || item.finalizado === 'No iniciado').length;
    
    return {
      completadas,
      pendientes,
      noIniciadas,
      total: listadoFinal.length
    };
  }, [listadoFinal]);

  // Filtrar y paginar los datos
  const datosFiltrados = useMemo(() => {
    if (!listadoFinal || listadoFinal.length === 0) return [];
    
    let filtered = [...listadoFinal];
    
    // Aplicar filtro por estado
    if (estadoFiltro !== 'Todos') {
      if (estadoFiltro === 'No iniciado') {
        filtered = filtered.filter(item => !item.finalizado || item.finalizado === 'No iniciado');
      } else {
        filtered = filtered.filter(item => item.finalizado === estadoFiltro);
      }
    }
    
    return filtered;
  }, [listadoFinal, estadoFiltro]);

  // Paginar los datos filtrados
  const datosPaginados = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return datosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [datosFiltrados, page, itemsPerPage]);

  // Total de páginas para la paginación
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(datosFiltrados.length / itemsPerPage)), 
    [datosFiltrados, itemsPerPage]
  );

  // Memoizamos las funciones para evitar recrearlas en cada render
  const updateSummary = useCallback((pesosValue, dolaresValue, data) => {
    let extraerPesos = 0;
    let sumTotalPesos = 0;
    let dineroEnStackerPesos = 0;
    let extraerDolares = 0;
    let sumTotalDolares = 0;
    let dineroEnStackerDolares = 0;

    // Calcular dinero en stacker: máquinas con bill menor al límite
    data.forEach(machine => {
        const bill = parseFloat(machine.bill);
        if (machine.moneda === 'pesos') {
            if (bill < pesosValue) {
                // Sumar el valor de las máquinas que no cumplen el límite de pesos
                dineroEnStackerPesos += bill;
            }
        } else if (machine.moneda === 'dolares') {
            if (bill < dolaresValue) {
                // Sumar el valor de las máquinas que no cumplen el límite de dólares
                dineroEnStackerDolares += bill;
            }
        }
    });

    // Filtrar las máquinas que cumplen con los límites seleccionados
    const listadoFiltrado = data.filter(machine => 
        (machine.moneda === 'pesos' && parseFloat(machine.bill) >= pesosValue) || 
        (machine.moneda === 'dolares' && parseFloat(machine.bill) >= dolaresValue)
    );

    // Ahora que tenemos el listado filtrado, calculemos el resumen
    listadoFiltrado.forEach(machine => {
        const bill = parseFloat(machine.bill);
        if (machine.moneda === 'pesos') {
            sumTotalPesos += bill;
            extraerPesos++;
        } else if (machine.moneda === 'dolares') {
            sumTotalDolares += bill;
            extraerDolares++;
        }
    });

    // Actualizar el estado de las cantidades y totales
    setCant(extraerPesos);
    setTotal(sumTotalPesos);
    setDineroEnStacker(dineroEnStackerPesos);  // Dinero en stacker para pesos

    setCantDolares(extraerDolares);
    setTotalDolares(sumTotalDolares);
    setDineroEnStackerDolares(dineroEnStackerDolares);  // Dinero en stacker para dólares
  }, []);

  const handleTableUpdate = useCallback((updatedTable) => {
    console.log('Datos recibidos:', updatedTable);
    
    // Actualizar directamente el listado filtrado
    if (updatedTable && updatedTable.length > 0) {
      setListadoFinal(updatedTable);
    }
  
    // Aquí llamamos directamente a updateSummary para asegurarnos de que se use la tabla actualizada
    updateSummary(valuePesos, valueDolares, resumen);
  }, [valuePesos, valueDolares, resumen, updateSummary]);

  // Función para cargar datos de listado_filtrado
  const loadFilteredData = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await axios.get(`${API_URL}/api/getListadoFiltrado`);
      if (response.data && response.data.length > 0) {
        setListadoFinal(response.data);
        
        // También cargar la última configuración
        const configResponse = await axios.get(`${API_URL}/api/getConfig`);
        if (configResponse.data) {
          setValuePesos(configResponse.data.limite || 0);
          setValueDolares(configResponse.data.limiteDolar || 1);
        }
      }
    } catch (error) {
      console.error('Error al cargar listado filtrado:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Cuando cambia el filtro, reset a la primera página
  useEffect(() => {
    setPage(1);
  }, [estadoFiltro]);

  useEffect(() => {
    // Cargar datos filtrados al montar el componente
    loadFilteredData();

    const newSocket = io(API_URL); // Conectar al endpoint correcto

    newSocket.on('connect_error', (error) => {
      console.error('Error de conexión al socket:', error);
    });
    
    newSocket.on('tableUpdate', handleTableUpdate);

    return () => {
      newSocket.off('tableUpdate', handleTableUpdate);
      newSocket.disconnect();
    };
  }, [loadFilteredData, handleTableUpdate]);

  const handleChangePesos = (event, newValue) => {
      setValuePesos(newValue);
      updateSummary(newValue, valueDolares, resumen);  // Solo actualizar el resumen aquí
  };

  const handleChangeDolares = (event, newValue) => {
      setValueDolares(newValue);
      updateSummary(valuePesos, newValue, resumen);  // Solo actualizar el resumen aquí
  };

  const handleClick = async () => {
    if (listadoFinal.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'No hay máquinas disponibles para enviar.',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando máquinas:', listadoFinal);

      // Enviar la configuración y las máquinas filtradas al backend
      await postMaquinas({ machines: resumen, valuePesos, valueDolares });
      await postConfig({ valuePesos, valueDolares });

      Swal.fire({
        icon: 'success',
        title: 'Configuración confirmada',
        text: 'Los datos de límites han sido enviados correctamente.',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al enviar la configuración.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setResumen(props);
    updateSummary(valuePesos, valueDolares, props);
  }, [props, updateSummary, valuePesos, valueDolares]);

  const handleGenerateReport = async () => {
    setIsLoading(true); // Iniciar el estado de cargando
    try {
        // Realiza una petición al backend para generar y enviar el reporte
        await postGenerateReport();

        console.log('generateReport');
        
        Swal.fire({
            icon: 'success',
            title: 'Reporte técnica generado',
            text: 'El reporte técnica se ha generado y enviado correctamente.',
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al generar el reporte técnica.',
        });
    } finally {
        setIsLoading(false); // Asegurar que el botón se habilite siempre
    }
  };

  const handleGenerateDailyReport = async () => {
    setIsLoading(true); // Iniciar el estado de cargando
    try {
        // Realiza una petición al backend para generar y enviar el reporte diario
        await postGenerateDailyReport();

        console.log('generateDailyReport');
        
        Swal.fire({
            icon: 'success',
            title: 'Resumen extracciones generado',
            text: 'El resumen de extracciones se ha generado y enviado correctamente.',
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al generar el resumen de extracciones.',
        });
    } finally {
        setIsLoading(false); // Asegurar que el botón se habilite siempre
    }
  };

  // Manejador para cambio de página
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Manejador para cambio de filtro
  const handleFilterChange = (event) => {
    setEstadoFiltro(event.target.value);
  };

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Configuración de Extracción de Casino
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ajuste los límites de extracción y revise el resumen
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography gutterBottom>Límite de dinero a extraer por máquina (Pesos)</Typography>
          <Slider
            value={valuePesos}
            onChange={handleChangePesos}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            min={0}
            max={100000}
            step={5000}
          />
          <Typography variant="body2" color="text.secondary">
            Límite seleccionado: ${valuePesos.toLocaleString('en-US')}
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography gutterBottom>Límite de dólares a extraer por máquina</Typography>
          <Slider
            value={valueDolares}
            onChange={handleChangeDolares}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            min={1}
            max={1000}
            step={5}
          />
          <Typography variant="body2" color="text.secondary">
            Límite seleccionado: ${valueDolares.toLocaleString('en-US')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Máquinas a extraer</Typography>
            <Typography variant="h6">{cant}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Total a extraer</Typography>
            <Typography variant="h6">${total.toLocaleString('en-US')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Dinero en stacker</Typography>
            <Typography variant="h6">${dineroEnStacker.toLocaleString('en-US')}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4, mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            Resumen de Máquinas en Dólares
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Máquinas a extraer (Dólares)</Typography>
            <Typography variant="h6">{cantDolares}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Total a extraer (Dólares)</Typography>
            <Typography variant="h6">${totalDolares.toLocaleString('en-US')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Dinero en stacker (Dólares)</Typography>
            <Typography variant="h6">${dineroEnStackerDolares.toLocaleString('en-US')}</Typography>
          </Box>
        </Box>

        <Button variant='contained' color='primary' onClick={handleClick} disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Confirmar configuración'}
        </Button>

        <Box sx={{ my: 4 }}>
          <Button
              variant='contained'
              color='secondary'
              onClick={handleGenerateReport}
              disabled={isLoading}
              sx={{ mt: 2, mr: 2 }}
          >
              {isLoading ? 'Generando reporte...' : 'Enviar reporte técnica'}
          </Button>
          
          <Button
              variant='contained'
              color='primary'
              onClick={handleGenerateDailyReport}
              disabled={isLoading}
              sx={{ mt: 2 }}
          >
              {isLoading ? 'Generando reporte...' : 'Enviar resumen extracciones'}
          </Button>
        </Box>

        {/* Sección de la tabla con resumen, filtros y paginación */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Listado de Máquinas
        </Typography>

        {/* Cuadro resumen */}
        {!loadingData && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Resumen de Estado
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1 }}>
                  <Chip 
                    label={`Completadas: ${conteos.completadas}`} 
                    color="success" 
                    sx={{ fontSize: '1rem', width: '100%', height: 'auto', py: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1 }}>
                  <Chip 
                    label={`Pendientes: ${conteos.pendientes}`} 
                    color="warning" 
                    sx={{ fontSize: '1rem', width: '100%', height: 'auto', py: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1 }}>
                  <Chip 
                    label={`No iniciadas: ${conteos.noIniciadas}`} 
                    color="error" 
                    sx={{ fontSize: '1rem', width: '100%', height: 'auto', py: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1 }}>
                  <Chip 
                    label={`Total: ${conteos.total}`} 
                    color="primary" 
                    sx={{ fontSize: '1rem', width: '100%', height: 'auto', py: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Filtros y controles */}
        {!loadingData && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="estado-filtro-label">Filtrar por estado</InputLabel>
              <Select
                labelId="estado-filtro-label"
                id="estado-filtro"
                value={estadoFiltro}
                label="Filtrar por estado"
                onChange={handleFilterChange}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Completa">Completadas</MenuItem>
                <MenuItem value="Pendiente">Pendientes</MenuItem>
                <MenuItem value="No iniciado">No iniciadas</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary">
              Mostrando {datosFiltrados.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} - {Math.min(page * itemsPerPage, datosFiltrados.length)} de {datosFiltrados.length} máquinas
            </Typography>
          </Box>
        )}

        {/* Tabla de máquinas */}
        {loadingData ? (
          <Typography>Cargando datos...</Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Máquina</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Asistente 1</TableCell>
                    <TableCell>Asistente 2</TableCell>
                    <TableCell>Extracción</TableCell>
                    <TableCell>Comentario</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosPaginados.length > 0 ? (
                    datosPaginados.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: item.finalizado === 'Completa' ? 'rgba(134, 239, 172, 0.5)' : 
                                          item.finalizado === 'Pendiente' ? 'rgba(252, 165, 165, 0.5)' : 
                                          'transparent'
                        }}
                      >
                        <TableCell component="th" scope="row">{(page - 1) * itemsPerPage + index + 1}</TableCell>
                        <TableCell>{item.maquina || item.machine}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.asistente1 || '-'}</TableCell>
                        <TableCell>{item.asistente2 || '-'}</TableCell>
                        <TableCell>{item.finalizado || 'No iniciado'}</TableCell>
                        <TableCell>{item.comentario || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No hay máquinas que coincidan con el filtro seleccionado</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton
              />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}