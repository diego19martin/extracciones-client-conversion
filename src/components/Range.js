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
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
  Container,
  Tooltip,
  Badge
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  const [itemsPerPage] = useState(isMobile ? 10 : 20); // Menos elementos por página en móvil

  // Función para mostrar los detalles de la máquina con SweetAlert2
  const showMachineDetails = (machine) => {
    const hasComment = machine.comentario && machine.comentario.trim() !== '';
    
    // Determinar el color del ícono basado en el estado
    let iconColor = '';
    if (machine.finalizado === 'Completa') {
      iconColor = '#2e7d32'; // Verde
    } else if (machine.finalizado === 'Pendiente') {
      iconColor = '#ed6c02'; // Naranja
    } else if (hasComment) {
      iconColor = '#9c27b0'; // Púrpura para novedades
    } else {
      iconColor = '#d32f2f'; // Rojo para no iniciadas
    }

    // Crear el contenido HTML para el modal
    let htmlContent = `
      <div style="text-align: left; margin-bottom: 15px;">
        <h3 style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Información de Máquina</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <p style="color: #666; margin: 0; font-size: 14px;">Máquina:</p>
            <p style="margin: 0; font-weight: bold;">${machine.maquina || machine.machine}</p>
          </div>
          <div>
            <p style="color: #666; margin: 0; font-size: 14px;">Ubicación:</p>
            <p style="margin: 0; font-weight: bold;">${machine.location}</p>
          </div>
          <div>
            <p style="color: #666; margin: 0; font-size: 14px;">Estado:</p>
            <p style="margin: 0; font-weight: bold; color: ${iconColor};">
              ${machine.finalizado || 'No iniciado'}
            </p>
          </div>
    `;

    // Agregar información de asistentes si existe
    if (machine.asistente1) {
      htmlContent += `
        <div>
          <p style="color: #666; margin: 0; font-size: 14px;">Asistente 1:</p>
          <p style="margin: 0; font-weight: bold;">${machine.asistente1}</p>
        </div>
      `;
    }
    
    if (machine.asistente2) {
      htmlContent += `
        <div>
          <p style="color: #666; margin: 0; font-size: 14px;">Asistente 2:</p>
          <p style="margin: 0; font-weight: bold;">${machine.asistente2}</p>
        </div>
      `;
    }

    // Cerrar la grid
    htmlContent += `</div>`;

    // Agregar la sección de novedad técnica si existe
    if (hasComment) {
      htmlContent += `
        <h3 style="margin-top: 20px; margin-bottom: 10px; color: #9c27b0;">Novedad Técnica</h3>
        <div style="background-color: rgba(209, 196, 233, 0.2); border: 1px solid rgba(209, 196, 233, 0.5); border-radius: 4px; padding: 10px;">
          <p style="margin: 0;">${machine.comentario}</p>
        </div>
      `;
    }
    
    // Cerrar el contenedor principal
    htmlContent += `</div>`;

    // Mostrar el SweetAlert2
    Swal.fire({
      title: `Máquina ${machine.maquina || machine.machine}`,
      html: htmlContent,
      icon: hasComment ? 'warning' : 'info',
      iconColor: iconColor,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1976d2',
      width: isMobile ? '90%' : '600px'
    });
  };

  // Calcular conteos para el resumen
  const conteos = useMemo(() => {
    if (!listadoFinal || listadoFinal.length === 0) return { 
      completadas: 0, 
      pendientes: 0, 
      noIniciadas: 0, 
      total: 0,
      conNovedades: 0 // Nuevo contador para máquinas con comentarios
    };
    
    const completadas = listadoFinal.filter(item => item.finalizado === 'Completa').length;
    const pendientes = listadoFinal.filter(item => item.finalizado === 'Pendiente').length;
    const noIniciadas = listadoFinal.filter(item => !item.finalizado || item.finalizado === 'No iniciado').length;
    
    // Contar máquinas con comentarios
    const conNovedades = listadoFinal.filter(item => item.comentario && item.comentario.trim() !== '').length;
    
    return {
      completadas,
      pendientes,
      noIniciadas,
      total: listadoFinal.length,
      conNovedades
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
      } else if (estadoFiltro === 'Con novedad') {
        // Filtrar máquinas con comentarios
        filtered = filtered.filter(item => item.comentario && item.comentario.trim() !== '');
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

  // Función para exportar datos a CSV sin dependencias externas
  const exportToCSV = (data, fileName = 'listado_maquinas.csv') => {
    // Verificar si hay datos para exportar
    if (!data || data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar.',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Función para escapar campos con comas o comillas
      const escapeField = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        
        // Si el campo contiene comas, comillas o saltos de línea, encerrarlo entre comillas
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          // Reemplazar comillas dobles por dos comillas dobles (formato CSV)
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      // Definir las cabeceras
      const headers = [
        'Máquina', 'Ubicación', 'Dinero', 'Moneda', 'Estado', 
        'Asistente 1', 'Asistente 2', 'Comentario', 'Zona'
      ];

      // Crear la fila de cabeceras
      let csvContent = headers.join(',') + '\r\n';

      // Agregar cada fila de datos
      data.forEach(item => {
        const row = [
          escapeField(item.maquina || item.machine || ''),
          escapeField(item.location || ''),
          escapeField(item.bill || ''),
          escapeField(item.moneda || ''),
          escapeField(item.finalizado || 'No iniciado'),
          escapeField(item.asistente1 || ''),
          escapeField(item.asistente2 || ''),
          escapeField(item.comentario || ''),
          escapeField(item.zona || '')
        ];
        csvContent += row.join(',') + '\r\n';
      });

      // Crear el objeto Blob con el contenido CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear un enlace para descargar
      const link = document.createElement('a');
      
      // Crear la URL del objeto Blob
      const url = URL.createObjectURL(blob);
      
      // Configurar el enlace
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      // Agregar el enlace al DOM
      document.body.appendChild(link);
      
      // Simular clic en el enlace para iniciar la descarga
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Exportación completada',
        text: `El archivo ${fileName} se ha descargado correctamente.`,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de exportación',
        text: 'Ocurrió un problema al exportar los datos.'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        const response = await postGenerateReport();
        console.log('generateReport response:', response);
        
        const { message, status } = response.data || { message: 'Reporte técnica generado correctamente', status: 'success' };
        
        Swal.fire({
            icon: status || 'success',
            title: status === 'warning' ? 'Aviso' : status === 'error' ? 'Error' : 'Éxito',
            text: message || 'El reporte técnica se ha generado y enviado correctamente.',
        });

    } catch (error) {
        console.error('Error al generar reporte:', error);
        let errorMessage = 'Hubo un problema al generar el reporte técnica.';
        
        // Verificar si hay un mensaje de error específico en la respuesta
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
        });
    } finally {
        setIsLoading(false); // Asegurar que el botón se habilite siempre
    }
  };

  const handleGenerateDailyReport = async () => {
    setIsLoading(true); // Iniciar el estado de cargando
    try {
        // Realiza una petición al backend para generar y enviar el reporte diario
        const response = await postGenerateDailyReport();
        console.log('generateDailyReport response:', response);
        
        const { message, status } = response.data || { message: 'El resumen de extracciones se ha generado y enviado correctamente', status: 'success' };
        
        Swal.fire({
            icon: status || 'success',
            title: status === 'warning' ? 'Aviso' : status === 'error' ? 'Error' : 'Éxito',
            text: message || 'El resumen de extracciones se ha generado y enviado correctamente.',
        });

    } catch (error) {
        console.error('Error al generar reporte diario:', error);
        let errorMessage = 'Hubo un problema al generar el resumen de extracciones.';
        
        // Verificar si hay un mensaje de error específico en la respuesta
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
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
    <Card sx={{ maxWidth: '100%', margin: 'auto', mt: 2 }}>
      <CardContent sx={{ p: isMobile ? 1 : 2 }}>
        <Typography variant={isMobile ? "h6" : "h5"} component="div" gutterBottom align="center">
          Configuración de Extracción de Casino
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom align="center">
          Ajuste los límites de extracción y revise el resumen
        </Typography>

        <Box sx={{ my: 3 }}>
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

        <Box sx={{ my: 3 }}>
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

        {/* Panel de información para pesos - Adaptable para móvil */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            my: 2,
            gap: 2 
          }}
        >
          <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Máquinas a extraer</Typography>
            <Typography variant="h6">{cant}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Total a extraer</Typography>
            <Typography variant="h6">${total.toLocaleString('en-US')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Dinero en stacker</Typography>
            <Typography variant="h6">${dineroEnStacker.toLocaleString('en-US')}</Typography>
          </Box>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            Resumen de Máquinas en Dólares
          </Typography>
        </Box>

        {/* Panel de información para dólares - Adaptable para móvil */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            my: 2,
            gap: 2 
          }}
        >
          <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Máquinas a extraer (Dólares)</Typography>
            <Typography variant="h6">{cantDolares}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Total a extraer (Dólares)</Typography>
            <Typography variant="h6">${totalDolares.toLocaleString('en-US')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Dinero en stacker (Dólares)</Typography>
            <Typography variant="h6">${dineroEnStackerDolares.toLocaleString('en-US')}</Typography>
          </Box>
        </Box>

        {/* Botón de confirmar configuración */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Button 
            variant='contained' 
            color='primary' 
            onClick={handleClick} 
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ maxWidth: isMobile ? '100%' : '400px' }}
          >
            {isLoading ? 'Procesando...' : 'CONFIRMAR CONFIGURACIÓN'}
          </Button>
        </Box>

        {/* Botones de reporte - Adaptable para móvil */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center', 
            my: 2,
            gap: 2 
          }}
        >
          <Button
            variant='contained'
            color='secondary'
            onClick={handleGenerateReport}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ maxWidth: isMobile ? '100%' : '300px' }}
          >
            {isLoading ? 'Generando...' : 'ENVIAR REPORTE TÉCNICA'}
          </Button>
          
          <Button
            variant='contained'
            color='primary'
            onClick={handleGenerateDailyReport}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ maxWidth: isMobile ? '100%' : '300px' }}
          >
            {isLoading ? 'Generando...' : 'ENVIAR RESUMEN EXTRACCIONES'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Sección de la tabla con resumen, filtros y paginación */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }} align="center">
          Listado de Máquinas
        </Typography>

        {/* Cuadro resumen - Con contenedor centrado para escritorio */}
        {!loadingData && (
          <Box sx={{ 
            mb: 3,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Box sx={{ 
              width: '100%', 
              maxWidth: isMobile ? '100%' : '600px' // Ancho limitado en escritorio
            }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" align="center">
                Resumen de Estado
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1
              }}>
                {/* Completadas - Barra verde */}
                <Box sx={{ 
                  bgcolor: '#2e7d32', 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1">Completadas:</Typography>
                  <Typography variant="body1" fontWeight="bold">{conteos.completadas}</Typography>
                </Box>
                
                {/* Pendientes - Barra naranja */}
                <Box sx={{ 
                  bgcolor: '#ed6c02', 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1">Pendientes:</Typography>
                  <Typography variant="body1" fontWeight="bold">{conteos.pendientes}</Typography>
                </Box>
                
                {/* No iniciadas - Barra roja */}
                <Box sx={{ 
                  bgcolor: '#d32f2f', 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1">No iniciadas:</Typography>
                  <Typography variant="body1" fontWeight="bold">{conteos.noIniciadas}</Typography>
                </Box>
                
                {/* Novedades técnicas - Nueva barra púrpura */}
                <Box sx={{ 
                  bgcolor: '#9c27b0', 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1">Novedades técnicas:</Typography>
                  <Typography variant="body1" fontWeight="bold">{conteos.conNovedades}</Typography>
                </Box>
                
                {/* Total - Barra azul */}
                <Box sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body1">Total:</Typography>
                  <Typography variant="body1" fontWeight="bold">{conteos.total}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Filtros, controles y botón de exportación - Optimizado para móvil */}
        {!loadingData && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center', 
            mb: 2,
            gap: 2,
            maxWidth: isMobile ? '100%' : '900px',
            mx: 'auto'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              width: isMobile ? '100%' : 'auto'
            }}>
              <FormControl fullWidth={isMobile} sx={{ maxWidth: isMobile ? '100%' : '250px' }}>
                <InputLabel id="estado-filtro-label">Filtrar por estado</InputLabel>
                <Select
                  labelId="estado-filtro-label"
                  id="estado-filtro"
                  value={estadoFiltro}
                  label="Filtrar por estado"
                  onChange={handleFilterChange}
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Completa">Completadas</MenuItem>
                  <MenuItem value="Pendiente">Pendientes</MenuItem>
                  <MenuItem value="No iniciado">No iniciadas</MenuItem>
                  <MenuItem value="Con novedad">Con novedades técnicas</MenuItem>
                </Select>
              </FormControl>
              
              {/* Botón de exportar */}
              <Button
                variant="outlined"
                color="success"
                onClick={() => exportToCSV(
                  // Si hay filtro aplicado, exportamos los datos filtrados
                  estadoFiltro === 'Todos' ? listadoFinal : datosFiltrados,
                  // Nombre del archivo basado en el filtro
                  `maquinas_${estadoFiltro.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`
                )}
                startIcon={
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2e7d32',
                      fontSize: '18px'
                    }}
                  >
                    📊
                  </Box>
                }
                disabled={isLoading || listadoFinal.length === 0}
                sx={{ 
                  minWidth: isMobile ? '100%' : '140px',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold'
                }}
              >
                Exportar Excel
              </Button>
            </Box>
            
            {!isMobile && (
              <Typography variant="body2" color="text.secondary">
                Mostrando {datosFiltrados.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} - {Math.min(page * itemsPerPage, datosFiltrados.length)} de {datosFiltrados.length} máquinas
              </Typography>
            )}
          </Box>
        )}

        {/* Tabla de máquinas - Optimizada para móvil y centrada en escritorio */}
        {loadingData ? (
          <Typography align="center" sx={{ py: 4 }}>Cargando datos...</Typography>
        ) : (
          <Box sx={{ 
            maxWidth: isMobile ? '100%' : '900px',
            mx: 'auto'
          }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                maxHeight: isMobile ? 'calc(100vh - 600px)' : 'auto',
                overflowX: 'auto' 
              }}
            >
              <Table 
                sx={{ minWidth: isMobile ? 400 : 650 }} 
                aria-label="tabla de máquinas"
                size={isMobile ? "small" : "medium"}
              >
                <TableHead>
                  <TableRow>
                    <TableCell padding={isMobile ? "none" : "normal"}>#</TableCell>
                    <TableCell padding={isMobile ? "none" : "normal"}>Máquina</TableCell>
                    <TableCell padding={isMobile ? "none" : "normal"}>Location</TableCell>
                    {!isMobile && <TableCell>Asistente 1</TableCell>}
                    {!isMobile && <TableCell>Asistente 2</TableCell>}
                    <TableCell padding={isMobile ? "none" : "normal"}>Estado</TableCell>
                    {!isMobile && <TableCell>Comentario</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosPaginados.length > 0 ? (
                    datosPaginados.map((item, index) => {
                      const rowId = item.id || index;
                      const hasComment = item.comentario && item.comentario.trim() !== '';
                      
                      return (
                        <TableRow
                          key={rowId}
                          onClick={() => isMobile && hasComment ? showMachineDetails(item) : null}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            backgroundColor: item.finalizado === 'Completa' ? 'rgba(134, 239, 172, 0.5)' : 
                                            item.finalizado === 'Pendiente' ? 'rgba(252, 165, 165, 0.5)' : 
                                            hasComment ? 'rgba(209, 196, 233, 0.5)' : 
                                            'transparent',
                            cursor: isMobile && hasComment ? 'pointer' : 'default'
                          }}
                        >
                          <TableCell padding={isMobile ? "none" : "normal"} component="th" scope="row">
                            {(page - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell padding={isMobile ? "none" : "normal"}>
                            {/* Mostrar un indicador para máquinas con comentarios */}
                            {hasComment ? (
                              <Tooltip title={isMobile ? "Toca para ver novedad" : "Tiene novedad técnica"}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '50%',
                                      bgcolor: '#9c27b0',
                                      color: 'white',
                                      width: 20,
                                      height: 20,
                                      fontSize: '14px',
                                      fontWeight: 'bold',
                                      mr: 1
                                    }}
                                  >
                                    !
                                  </Box>
                                  {item.maquina || item.machine}
                                </Box>
                              </Tooltip>
                            ) : (
                              item.maquina || item.machine
                            )}
                          </TableCell>
                          <TableCell padding={isMobile ? "none" : "normal"}>{item.location}</TableCell>
                          {!isMobile && <TableCell>{item.asistente1 || '-'}</TableCell>}
                          {!isMobile && <TableCell>{item.asistente2 || '-'}</TableCell>}
                          <TableCell padding={isMobile ? "none" : "normal"}>{item.finalizado || 'No iniciado'}</TableCell>
                          {!isMobile && <TableCell>{item.comentario || '-'}</TableCell>}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 4 : 7} align="center">No hay máquinas que coincidan con el filtro seleccionado</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Información de paginación para móvil */}
            {isMobile && datosFiltrados.length > 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Mostrando {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, datosFiltrados.length)} de {datosFiltrados.length}
              </Typography>
            )}

            {/* Paginación */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}