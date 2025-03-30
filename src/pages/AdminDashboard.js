// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  LinearProgress,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Typography,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Refresh, Dashboard, Assessment, Map } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

// Importar componentes modulares
import { 
  DashboardHeader,
  AlertsSection,
  MainMetrics,
  ConciliationStatus,
  PerformanceMetrics,
  ConciliationsByZone,
  MonthlySummary,
  ConciliationTable,
  EmployeesTable,
  ZoneEfficiency,
  ConciliationSpeed,
  ZonesSummaryTable,
  MachineHeatmap
} from '../components/dashboard-admin';

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL
  : process.env.REACT_APP_HOST_LOCAL || 'http://localhost:4000';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Estados para almacenar datos del dashboard
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalMaquinas: 0,
      maquinasExtraccion: 0,
      maquinasConciliadas: 0,
      maquinasPendientes: 0,
      totalEmpleados: 0,
      totalZonas: 0,
      zonasConciliadas: 0,
      zonasPendientes: 0,
      montoTotal: 0,
      diferenciaTotal: 0,
      porcentajeConciliacion: 0
    },
    conciliacionesPorZona: [],
    resumenMensual: [],
    ultimasConciliaciones: [],
    alertas: [],
    topEmpleados: [],
    resumenZonas: [],
    rendimientoStats: {
      eficiencia: { tasa_match: 0, tasa_precision: 0, diferencia_promedio: 0 },
      eficiencia_zonas: [],
      velocidad_conciliacion: []
    },
    heatmapData: {}
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  // Función para cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      // Configurar cabeceras para todas las solicitudes
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Realizar todas las solicitudes en paralelo
      const [
        statsResponse,
        conciliacionesResponse,
        resumenResponse,
        ultimasResponse,
        alertasResponse,
        empleadosResponse,
        resumenZonasResponse,
        heatmapResponse,
        rendimientoResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, config),
        axios.get(`${API_URL}/api/admin/conciliaciones-por-zona`, config),
        axios.get(`${API_URL}/api/admin/resumen-mensual`, config),
        axios.get(`${API_URL}/api/admin/ultimas-conciliaciones`, config),
        axios.get(`${API_URL}/api/admin/alertas`, config),
        axios.get(`${API_URL}/api/admin/top-empleados`, config),
        axios.get(`${API_URL}/api/admin/resumen-zonas`, config),
        axios.get(`${API_URL}/api/admin/heatmap`, config),
        axios.get(`${API_URL}/api/admin/rendimiento`, config)
      ]);
      
      // Actualizar el estado con los datos recibidos
      setDashboardData({
        stats: statsResponse.data,
        conciliacionesPorZona: conciliacionesResponse.data,
        resumenMensual: resumenResponse.data,
        ultimasConciliaciones: ultimasResponse.data,
        alertas: alertasResponse.data,
        topEmpleados: empleadosResponse.data,
        resumenZonas: resumenZonasResponse.data,
        heatmapData: heatmapResponse.data,
        rendimientoStats: rendimientoResponse.data
      });
      
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Función para refrescar los datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Función para generar reporte
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      
      Swal.fire({
        title: 'Generando reporte...',
        text: 'El reporte estará disponible en unos segundos',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      // Configurar cabeceras para la solicitud
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Realizar la solicitud para generar el reporte
      const response = await axios.post(`${API_URL}/api/admin/generar-reporte`, {}, config);
      
      if (response.data && response.data.success) {
        const { filepath } = response.data;
        
        Swal.fire({
          title: 'Reporte generado',
          text: 'El reporte se ha generado correctamente',
          icon: 'success',
          confirmButtonText: 'Descargar',
          showCancelButton: true,
          cancelButtonText: 'Cerrar'
        }).then((result) => {
          if (result.isConfirmed && filepath) {
            // Abrir el archivo para descarga
            window.open(`${API_URL}${filepath}`, '_blank');
          }
        });
      } else {
        throw new Error('No se pudo generar el reporte');
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      
      Swal.fire({
        title: 'Error',
        text: 'No se pudo generar el reporte. Por favor, intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setReportLoading(false);
    }
  };

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Renderizar pantalla de carga
  if (loading && !refreshing) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          p: 3
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  // Calcular fecha actual
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Encabezado del dashboard */}
      <DashboardHeader 
        date={formattedDate}
        user={user}
        onRefresh={handleRefresh}
        onGenerateReport={handleGenerateReport}
        isRefreshing={refreshing}
        isReportLoading={reportLoading}
        isMobile={isMobile}
      />

      {/* Indicador de carga cuando se está refrescando */}
      {refreshing && <LinearProgress sx={{ mb: 3 }} />}
      
      {/* Pestañas de navegación */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          <Tab label="General" icon={<Dashboard />} iconPosition="start" />
          <Tab label="Rendimiento" icon={<Assessment />} iconPosition="start" />
          <Tab label="Distribución Espacial" icon={<Map />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Sección de alertas */}
      {dashboardData.alertas.length > 0 && (
        <AlertsSection alertas={dashboardData.alertas} />
      )}

      {/* Contenido de la pestaña General */}
      {activeTab === 0 && (
        <>
          {/* Tarjetas de métricas principales */}
          <MainMetrics stats={dashboardData.stats} />

          {/* Tarjetas de métricas de estado y progreso */}
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3, mb: 3 }}>
            <Box sx={{ flex: isMobile ? '1' : '2' }}>
              <ConciliationStatus stats={dashboardData.stats} isMobile={isMobile} />
            </Box>
            <Box sx={{ flex: '1' }}>
              <PerformanceMetrics rendimientoStats={dashboardData.rendimientoStats} />
            </Box>
          </Box>

          {/* Gráficos y tablas */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
              <Box sx={{ flex: '1' }}>
                <ConciliationsByZone data={dashboardData.conciliacionesPorZona} />
              </Box>
              <Box sx={{ flex: '1' }}>
                <MonthlySummary data={dashboardData.resumenMensual} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
              <Box sx={{ flex: '1' }}>
                <ConciliationTable conciliaciones={dashboardData.ultimasConciliaciones} />
              </Box>
              <Box sx={{ flex: '1' }}>
                <EmployeesTable empleados={dashboardData.topEmpleados} />
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Contenido de la pestaña Rendimiento */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
            <Box sx={{ flex: '1' }}>
              <ZoneEfficiency data={dashboardData.rendimientoStats.eficiencia_zonas || []} />
            </Box>
            <Box sx={{ flex: '1' }}>
              <ConciliationSpeed data={dashboardData.rendimientoStats.velocidad_conciliacion || []} />
            </Box>
          </Box>

          <ZonesSummaryTable 
            zonas={dashboardData.resumenZonas} 
            onGenerateReport={handleGenerateReport} 
          />
        </Box>
      )}

      {/* Contenido de la pestaña Distribución Espacial */}
      {activeTab === 2 && (
        <MachineHeatmap data={dashboardData.heatmapData} />
      )}
    </Box>
  );
};

export default AdminDashboard;