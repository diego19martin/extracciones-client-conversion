import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import ZonaCard from './ZonaCard';

/**
 * Componente para mostrar las zonas pendientes de confirmación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.zonas - Lista de zonas a mostrar
 * @param {Boolean} props.loading - Indicador de carga
 * @param {String} props.error - Mensaje de error (si existe)
 * @param {Function} props.onRefresh - Función para refrescar datos
 * @param {Function} props.onConfirmZona - Función para confirmar una zona
 * @param {Function} props.onViewZonaDetails - Función para ver detalles de una zona
 */
const ZonasPendientesSection = ({ 
  zonas = [],
  loading = false,
  error = null,
  onRefresh,
  onConfirmZona,
  onViewZonaDetails
}) => {
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  
  // Contar zonas por estado
  const pendingCount = zonas.filter(z => !z.confirmada).length;
  const confirmedCount = zonas.filter(z => z.confirmada).length;
  
  // Filtrar zonas según el estado seleccionado y término de búsqueda
  const filteredZonas = zonas.filter(zona => {
    // Filtrar por estado
    if (filterValue === 'pending' && zona.confirmada) return false;
    if (filterValue === 'confirmed' && !zona.confirmada) return false;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        zona.zona.toString().toLowerCase().includes(searchLower) ||
        (zona.usuario && zona.usuario.toLowerCase().includes(searchLower)) ||
        zona.id.toString().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Manejar cambio de filtro
  const handleFilterChange = (event, newValue) => {
    setFilterValue(newValue);
  };
  
  // Manejar cambio de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // Renderizar mensaje de estado vacío
  const renderEmptyState = () => (
    <Box sx={{
      py: 6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      bgcolor: 'grey.50',
      borderRadius: 2,
      px: 3
    }}>
      <InfoIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.6, mb: 2 }} />
      
      {filterValue === 'pending' && (
        <>
          <Typography variant="h6" gutterBottom>
            No hay zonas pendientes de confirmación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
            Todas las zonas han sido confirmadas. ¡Buen trabajo!
          </Typography>
        </>
      )}
      
      {filterValue === 'confirmed' && (
        <>
          <Typography variant="h6" gutterBottom>
            No hay zonas confirmadas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
            Aún no se ha confirmado ninguna zona. Las zonas confirmadas aparecerán aquí.
          </Typography>
        </>
      )}
      
      {filterValue === 'all' && (
        <>
          <Typography variant="h6" gutterBottom>
            No hay zonas disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
            No se encontraron zonas en el sistema. Las zonas aparecerán aquí cuando estén disponibles.
          </Typography>
        </>
      )}
      
      {searchTerm && (
        <>
          <Typography variant="h6" gutterBottom>
            No se encontraron resultados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
            No se encontraron zonas que coincidan con "{searchTerm}". Intente con otro término de búsqueda.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleClearSearch} 
            sx={{ mt: 2 }}
            startIcon={<ClearIcon />}
          >
            Limpiar búsqueda
          </Button>
        </>
      )}
      
      {onRefresh && !searchTerm && (
        <Button 
          variant="outlined" 
          onClick={onRefresh} 
          sx={{ mt: 2 }}
          startIcon={<RefreshIcon />}
        >
          Actualizar
        </Button>
      )}
    </Box>
  );
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Encabezado de la sección */}
      <Box 
        sx={{ 
          p: 2,
          bgcolor: 'grey.50',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h6" component="h2">
          Zonas
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}>
          {/* Búsqueda */}
          <TextField
            placeholder="Buscar zona..."
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
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ minWidth: 200 }}
          />
          
          {/* Botón de actualizar */}
          {onRefresh && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              size="small"
            >
              Actualizar
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Tabs para filtrar */}
      <Box sx={{ 
        px: 2, 
        pt: 1, 
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Tabs 
          value={filterValue} 
          onChange={handleFilterChange}
          aria-label="filtro de zonas"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={
              <Badge badgeContent={zonas.length} color="primary">
                <InfoIcon />
              </Badge>
            }
            iconPosition="start"
            label="Todas" 
            value="all" 
          />
          <Tab 
            icon={
              <Badge badgeContent={pendingCount} color="warning">
                <WarningIcon />
              </Badge>
            }
            iconPosition="start"
            label="Pendientes" 
            value="pending" 
          />
          <Tab 
            icon={
              <Badge badgeContent={confirmedCount} color="success">
                <CheckCircleIcon />
              </Badge>
            }
            iconPosition="start"
            label="Confirmadas" 
            value="confirmed" 
          />
        </Tabs>
      </Box>
      
      {/* Contenido principal */}
      <Box sx={{ 
        p: 2, 
        flexGrow: 1,
        overflow: 'auto'
      }}>
        {/* Estado de carga */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 4 
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Mensaje de error */}
        {!loading && error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              onRefresh && (
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={onRefresh}
                >
                  Reintentar
                </Button>
              )
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Lista de zonas */}
        {!loading && !error && (
          filteredZonas.length > 0 ? (
            <Grid container spacing={3}>
              {filteredZonas.map(zona => (
                <Grid item xs={12} md={6} lg={4} key={zona.id}>
                  <ZonaCard 
                    zona={zona}
                    onConfirm={onConfirmZona}
                    onViewDetails={onViewZonaDetails}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            renderEmptyState()
          )
        )}
      </Box>
      
      {/* Pie con resumen (solo si hay zonas) */}
      {!loading && !error && filteredZonas.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}>
          <Stack 
            direction="row" 
            spacing={2} 
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Typography variant="body2" color="text.secondary">
              Total: {filteredZonas.length} zona{filteredZonas.length !== 1 ? 's' : ''}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Pendientes: {filteredZonas.filter(z => !z.confirmada).length}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Confirmadas: {filteredZonas.filter(z => z.confirmada).length}
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default ZonasPendientesSection;