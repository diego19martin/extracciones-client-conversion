// src/components/dashboard-admin/DashboardHeader.js
import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Print, Refresh } from '@mui/icons-material';

const DashboardHeader = ({ 
  date, 
  user, 
  onRefresh, 
  onGenerateReport, 
  isRefreshing, 
  isReportLoading,
  isMobile
}) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 3 
      }}
    >
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard de Gerencia
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {date}
        </Typography>
        {user && (
          <Typography variant="subtitle2" color="primary">
            Bienvenido, {user.nombre || user.username}
          </Typography>
        )}
      </Box>
      <Box sx={{ mt: isMobile ? 2 : 0, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Print />}
          onClick={onGenerateReport}
          disabled={isReportLoading}
        >
          {isReportLoading ? 'Generando...' : 'Generar Reporte'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardHeader;