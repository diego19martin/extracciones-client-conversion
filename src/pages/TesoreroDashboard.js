import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

// Componentes propios
import TesoreroDashboardHeader from '../components/dashboard-tesorero/TesoreroDashboardHeader';
import ZonasPendientesSection from '../components/dashboard-tesorero/ZonasPendientesSection';
import MachineDetailsSection from '../components/dashboard-tesorero/MachineDetailsSection';

// API y utilidades
import { 
  obtenerConciliaciones, 
  confirmarConciliacionZona,
  obtenerConciliacionDetalle 
} from '../api/zona-conciliacion.api';

// Función para confirmar una zona con Swal
const confirmarZonaConModal = async (zona, onSuccess) => {
  if (!zona || !zona.id) return;
  
  // Mostrar modal con Swal
  const { value: formValues } = await Swal.fire({
    title: `Confirmar Zona ${zona.zona}`,
    html: `
      <div style="text-align: left">
        <p>¿Confirma que ha recibido el dinero correspondiente a esta zona?</p>
        <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
          <p style="margin: 5px 0;">Total esperado: <strong>${zona.total_esperado?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}</strong></p>
          <p style="margin: 5px 0;">Total contado: <strong>${zona.total_contado?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}</strong></p>
          <p style="margin: 5px 0;">Diferencia: <strong style="color: ${(zona.total_contado - zona.total_esperado) >= 0 ? 'green' : 'red'}">
            ${(zona.total_contado - zona.total_esperado)?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}
          </strong></p>
        </div>
        <p>Usuario que confirma:</p>
        <input 
          id="swal-input-usuario" 
          class="swal2-input" 
          placeholder="Ingrese su nombre de usuario" 
          style="width: 100%"
        >
        <p>Comentarios (opcional):</p>
        <textarea 
          id="swal-input-comentarios" 
          class="swal2-textarea" 
          placeholder="Comentarios adicionales..." 
          style="width: 100%; min-height: 100px"
        ></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4caf50',
    preConfirm: () => {
      const usuario = document.getElementById('swal-input-usuario').value;
      const comentarios = document.getElementById('swal-input-comentarios').value;
      
      if (!usuario) {
        Swal.showValidationMessage('Debe ingresar su nombre de usuario');
        return false;
      }
      
      return {
        usuario,
        comentarios
      };
    }
  });
  
  // Si se canceló, no continuamos
  if (!formValues) return;
  
  // Mostrar indicador de carga
  Swal.fire({
    title: 'Confirmando zona...',
    text: 'Procesando su solicitud',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Llamar a la API para confirmar
    await confirmarConciliacionZona(zona.id, formValues.usuario);
    
    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Zona confirmada!',
      text: 'La zona ha sido confirmada exitosamente',
      timer: 3000,
      timerProgressBar: true
    });
    
    // Ejecutar callback si está definido
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess();
    }
    
    return true;
  } catch (error) {
    // Mostrar mensaje de error
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Ocurrió un error al confirmar la zona',
      confirmButtonText: 'Aceptar'
    });
    
    return false;
  }
};

/**
 * Dashboard principal del Tesorero
 */
const TesoreroDashboard = () => {
  // Estados principales
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Estado para la vista detallada
  const [selectedZona, setSelectedZona] = useState(null);
  const [zonaMachines, setZonaMachines] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  
  // Resumen del dashboard
  const [summary, setSummary] = useState({
    totalZonas: 0,
    zonasConfirmadas: 0,
    zonasPendientes: 0,
    totalEsperado: 0,
    totalContado: 0,
    lastUpdate: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
  });
  
  // Efecto para cargar datos cuando se monta el componente
  useEffect(() => {
    fetchZonas();
  }, []);
  
  // Función para cargar zonas (siempre del día actual)
  const fetchZonas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar la fecha actual como filtro
      const today = format(new Date(), 'yyyy-MM-dd');
      const data = await obtenerConciliaciones({ fecha: today });
      
      // Validar los datos
      if (!Array.isArray(data)) {
        throw new Error('El formato de datos recibido no es válido');
      }
      
      // Actualizar estado con las zonas
      setZonas(data);
      
      // Actualizar resumen
      updateSummary(data);
      
      // Mostrar notificación
      if (data.length === 0) {
        setNotification({
          open: true,
          message: 'No hay zonas disponibles para el día de hoy',
          severity: 'info'
        });
      }
    } catch (err) {
      console.error('Error al cargar zonas:', err);
      setError('Error al cargar zonas. Por favor, intente nuevamente más tarde.');
      
      setNotification({
        open: true,
        message: 'Error al cargar zonas: ' + (err.message || 'Error desconocido'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Función para actualizar el resumen
  const updateSummary = (zonasData) => {
    const zonasConfirmadas = zonasData.filter(z => z.confirmada).length;
    const zonasPendientes = zonasData.filter(z => !z.confirmada).length;
    
    // Calcular totales
    const totalEsperado = zonasData.reduce((sum, z) => sum + (parseFloat(z.total_esperado) || 0), 0);
    const totalContado = zonasData.reduce((sum, z) => sum + (parseFloat(z.total_contado) || 0), 0);
    
    setSummary({
      totalZonas: zonasData.length,
      zonasConfirmadas,
      zonasPendientes,
      totalEsperado,
      totalContado,
      lastUpdate: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
    });
  };
  
  // Función para ver detalles de una zona
  // Función para ver detalles de una zona
const handleViewZonaDetails = async (zona) => {
  if (!zona || !zona.id) return;
  
  setSelectedZona(zona);
  setLoadingDetails(true);
  setDetailsError(null);
  setZonaMachines([]); // Limpiar máquinas anteriores
  
  try {
    // Obtener detalles completos de la zona
    const detallesZona = await obtenerConciliacionDetalle(zona.id);
    
    if (detallesZona && Array.isArray(detallesZona.detalles)) {
      console.log('Detalles de zona recibidos:', detallesZona);
      
      // Transformar los datos al formato esperado por el componente MachineDetailsSection
      const machinesProcessed = detallesZona.detalles.map(machine => {
        // Convertir valores a números
        const expectedAmount = parseFloat(machine.valor_esperado) || 0;
        const countedAmount = parseFloat(machine.valor_contado) || 0;
        const diferencia = countedAmount - expectedAmount;
        
        // Determinar el estado basado en la diferencia o el campo estado de la BD
        let status = (machine.estado || '').toLowerCase();
        
        if (!status || status === 'unknown') {
          if (Math.abs(diferencia) < 0.01) {
            status = 'match';
          } else if (countedAmount === 0 && expectedAmount > 0) {
            status = 'missing';
          } else if (expectedAmount === 0 && countedAmount > 0) {
            status = 'extra';
          } else {
            status = 'mismatch';
          }
        }
        
        // Extraer información de billetes si existe
        let detallesBilletes;
        try {
          if (machine.detalles_billetes) {
            detallesBilletes = typeof machine.detalles_billetes === 'string'
              ? JSON.parse(machine.detalles_billetes)
              : machine.detalles_billetes;
          } else {
            detallesBilletes = {};
          }
        } catch (error) {
          console.error('Error al parsear detalles_billetes:', error);
          detallesBilletes = {};
        }
        
        return {
          machineId: machine.maquina || '',
          headercard: machine.headercard || '',
          location: machine.location || '',
          expectedAmount: expectedAmount,
          countedAmount: countedAmount,
          difference: diferencia,
          status: status,
          countedPhysical: parseFloat(machine.valor_fisico) || 0,
          countedVirtual: parseFloat(machine.valor_virtual) || 0,
          // Si hay detalles adicionales de billetes, incluirlos
          billetesFisicos: detallesBilletes.billetesFisicos || {},
          billetesVirtuales: detallesBilletes.billetesVirtuales || {}
        };
      });
      
      
      console.log('Máquinas procesadas:', machinesProcessed);
      setZonaMachines(machinesProcessed);
    } else {
      console.error('Formato inesperado de detalles:', detallesZona);
      setZonaMachines([]);
      setDetailsError('No se pudieron cargar los detalles de máquinas para esta zona. Formato de datos incorrecto.');
    }
  } catch (err) {
    console.error('Error al cargar detalles de zona:', err);
    setDetailsError('Error al cargar detalles: ' + (err.message || 'Error desconocido'));
  } finally {
    setLoadingDetails(false);
  }
};
  
  // Función para confirmar una zona
  const handleConfirmZona = async (zona) => {
    if (!zona || !zona.id) return;
    
    // Usar la función para mostrar modal y confirmar
    const confirmado = await confirmarZonaConModal(zona, async () => {
      // Recargar zonas después de confirmar
      await fetchZonas();
      
      // Si estamos viendo detalles de una zona, actualizar esa zona
      if (selectedZona && selectedZona.id === zona.id) {
        const updatedZonas = zonas.map(z => 
          z.id === zona.id ? { ...z, confirmada: true } : z
        );
        setZonas(updatedZonas);
        setSelectedZona({ ...selectedZona, confirmada: true });
      }
    });
    
    return confirmado;
  };
  
  // Función para volver a la vista de zonas
  const handleBackToZonas = () => {
    setSelectedZona(null);
    setZonaMachines([]);
  };
  
  // Función para cerrar notificaciones
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f5f7fa',
        py: 3
      }}
    >
      <Container maxWidth="xl">
        {/* Encabezado con resumen */}
        <TesoreroDashboardHeader 
          summary={summary} 
          loading={loading} 
        />
        
        {/* Vista principal - Condicional según si hay zona seleccionada */}
        {selectedZona ? (
          // Vista de detalles de zona
          <MachineDetailsSection 
            zona={selectedZona}
            machines={zonaMachines}
            loading={loadingDetails}
            error={detailsError}
            onBack={handleBackToZonas}
            onConfirmZona={!selectedZona.confirmada ? handleConfirmZona : undefined}
          />
        ) : (
          // Vista de lista de zonas
          <ZonasPendientesSection 
            zonas={zonas}
            loading={loading}
            error={error}
            onRefresh={fetchZonas}
            onConfirmZona={handleConfirmZona}
            onViewZonaDetails={handleViewZonaDetails}
          />
        )}
      </Container>
      
      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TesoreroDashboard;