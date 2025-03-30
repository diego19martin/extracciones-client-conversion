// TesoreroDashboard.js - Archivo principal actualizado con navbar
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SyncIcon from '@mui/icons-material/Sync';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import axios from 'axios';
import Swal from 'sweetalert2';

// Componentes importados
import { 
  FilterPanel, 
  MachinesTable, 
  MachineDetailsModal,
  ZoneSummary,
  TesoreroSummary // Mantenemos la importación de TesoreroSummary
} from '../components/dashboard-tesorero';
import { determineBaseUrl } from '../utils/apiUtils';
import { formatDate } from '../utils/formatUtils';

const API_URL = determineBaseUrl();

// Función para el panel de pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TesoreroDashboard = () => {
  // Estados
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summary, setSummary] = useState({
    totalMachines: 0,
    conciliatedMachines: 0,
    issuesMachines: 0,
    lastUpdate: ''
  });
  
  // Estado para las pestañas
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    zona: '',
    estado: '',
    conciliado: '',
    tiene_novedad: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Opciones de filtro para zona
  const [zonaOptions, setZonaOptions] = useState([]);
  
  // Estado para panel de filtros
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Cargar estadísticas de resumen
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tesorero/resumen`);
        
        if (response.data) {
          setSummary({
            totalMachines: response.data.total || 66,
            conciliatedMachines: response.data.conciliadas || 20,
            issuesMachines: response.data.con_novedades || 18,
            lastUpdate: response.data.ultima_actualizacion || '24/03/2025, 08:57:06 p. m.'
          });
        }
      } catch (error) {
        console.error('Error al cargar resumen:', error);
        // Datos de ejemplo
        setSummary({
          totalMachines: 66,
          conciliatedMachines: 20,
          issuesMachines: 18,
          lastUpdate: '24/03/2025, 08:57:06 p. m.'
        });
      }
    };
    
    fetchSummary();
  }, []);

  // Cargar máquinas al inicio y cuando cambien los filtros o la paginación
  useEffect(() => {
    if (tabValue === 1) { // Solo cargar datos de máquinas en la pestaña de Máquinas
      fetchMachines();
    }
  }, [page, limit, filters, tabValue]);
  
  // Función para cargar máquinas desde la API
  const fetchMachines = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      // Agregar paginación
      params.append('pagina', page);
      params.append('limite', limit);
      
      const response = await axios.get(`${API_URL}/api/tesorero/maquinas?${params.toString()}`);
      
      if (response.data && response.data.data) {
        setMachines(response.data.data);
        setTotal(response.data.total);
      } else {
        setMachines([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error al cargar máquinas del tesorero:', err);
      setError('Error al cargar datos. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar opciones de zonas disponibles
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tesorero/maquinas`);
        if (response.data && response.data.data) {
          // Extraer zonas únicas
          const zonas = [...new Set(response.data.data.map(machine => machine.zona))];
          setZonaOptions(zonas.filter(Boolean).sort());
        }
      } catch (err) {
        console.error('Error al cargar zonas:', err);
      }
    };
    
    fetchZonas();
  }, []);
  
  // Función para sincronizar máquinas
  const handleSync = async () => {
    // Pedir confirmación antes de sincronizar
    const result = await Swal.fire({
      title: '¿Sincronizar máquinas?',
      text: 'Esta acción actualizará los datos de todas las máquinas desde la tabla de listado. ¿Desea continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, sincronizar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    setSyncLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/tesorero/sincronizar`);
      
      Swal.fire({
        title: 'Sincronización completada',
        html: `
          <p>Se han procesado un total de <strong>${response.data.total}</strong> máquinas:</p>
          <ul>
            <li>Actualizadas: <strong>${response.data.actualizadas}</strong></li>
            <li>Nuevas: <strong>${response.data.nuevas}</strong></li>
          </ul>
        `,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      
      // Recargar datos
      fetchMachines();
      
    } catch (err) {
      console.error('Error al sincronizar máquinas:', err);
      
      Swal.fire({
        title: 'Error',
        text: 'No se pudo completar la sincronización. Intente nuevamente más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setSyncLoading(false);
    }
  };
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Resetear paginación al cambiar filtros
    setPage(1);
  };
  
  // Función para limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      zona: '',
      estado: '',
      conciliado: '',
      tiene_novedad: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  };
  
  // Función para ver detalles de una máquina
  const handleViewDetails = (machine) => {
    setSelectedMachine(machine);
    setDialogOpen(true);
  };
  
  // Función para cambiar de página
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  // Función para exportar a Excel
  const handleExportToExcel = () => {
    // Confirmar exportación
    Swal.fire({
      title: 'Exportar a Excel',
      text: `¿Desea exportar ${machines.length} registros a Excel?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Exportar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Implementar la exportación
        Swal.fire({
          title: 'Función no disponible',
          text: 'Para habilitar esta función, instale xlsx y file-saver: npm install xlsx file-saver',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
      }
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Encabezado del Dashboard */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Dashboard del Tesorero
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen(!filtersOpen)}
              sx={{ bgcolor: 'white' }}
            >
              MOSTRAR FILTROS
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchMachines}
              sx={{ bgcolor: 'white' }}
            >
              ACTUALIZAR
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              sx={{ bgcolor: 'white' }}
            >
              EXPORTAR
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={syncLoading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
              onClick={handleSync}
              disabled={syncLoading}
            >
              SINCRONIZAR
            </Button>
          </Box>
        </Box>
        
        {/* Panel de filtros */}
        {filtersOpen && (
          <FilterPanel 
            filters={filters}
            zonaOptions={zonaOptions}
            handleFilterChange={handleFilterChange}
            handleClearFilters={handleClearFilters}
            handleApplyFilters={fetchMachines}
          />
        )}

        {/* Componente TesoreroSummary para mostrar el resumen de zonas confirmadas */}
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Resumen de Zonas Confirmadas
          </Typography>
          <TesoreroSummary />
        </Box>
        
        {/* Se elimina la sección de tarjetas de resumen */}
        
        {/* Pestañas para alternar entre zonas y máquinas */}
        <Paper sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 'bold',
                py: 1.5
              }
            }}
          >
            <Tab 
              label="ZONAS" 
              id="dashboard-tab-0" 
              aria-controls="dashboard-tabpanel-0"
            />
            <Tab 
              label="MÁQUINAS" 
              id="dashboard-tab-1" 
              aria-controls="dashboard-tabpanel-1" 
            />
          </Tabs>
          
          {/* Panel de Zonas */}
          <TabPanel value={tabValue} index={0}>
            <ZoneSummary />
          </TabPanel>
          
          {/* Panel de Máquinas */}
          <TabPanel value={tabValue} index={1}>
            <MachinesTable 
              machines={machines}
              loading={loading}
              error={error}
              total={total}
              page={page}
              limit={limit}
              handlePageChange={handlePageChange}
              handleViewDetails={handleViewDetails}
            />
          </TabPanel>
        </Paper>
      </Container>
      
      {/* Modal de detalles de máquina */}
      <MachineDetailsModal 
        open={dialogOpen}
        machine={selectedMachine}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
};

export default TesoreroDashboard;