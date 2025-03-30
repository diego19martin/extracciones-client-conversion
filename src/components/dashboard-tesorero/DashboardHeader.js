// components/DashboardHeader.js
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

const DashboardHeader = ({ 
  title, 
  filtersOpen, 
  setFiltersOpen, 
  handleRefresh, 
  handleExport, 
  syncLoading, 
  handleSync,
  disableExport
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      <Box>
        <Button
          variant="outlined"
          startIcon={<FilterAltIcon />}
          onClick={() => setFiltersOpen(!filtersOpen)}
          sx={{ mr: 1 }}
        >
          {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ mr: 1 }}
        >
          Actualizar
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ mr: 1 }}
          disabled={disableExport}
        >
          Exportar
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={syncLoading ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={handleSync}
          disabled={syncLoading}
        >
          {syncLoading ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardHeader;