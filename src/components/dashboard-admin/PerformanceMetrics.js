// src/components/dashboard-admin/PerformanceMetrics.js
import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography, LinearProgress, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}));

const DashboardCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
}));

const DashboardCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingTop: theme.spacing(1),
}));

const PerformanceMetrics = ({ rendimientoStats }) => {
  const theme = useTheme();
  
  // Asegurarse de que los valores sean números y tengan valores por defecto si son nulos
  const tasaMatch = rendimientoStats?.eficiencia?.tasa_match 
    ? parseFloat(rendimientoStats.eficiencia.tasa_match) 
    : 0;
    
  const tasaPrecision = rendimientoStats?.eficiencia?.tasa_precision 
    ? parseFloat(rendimientoStats.eficiencia.tasa_precision) 
    : 0;
    
  const diferenciaPromedio = rendimientoStats?.eficiencia?.diferencia_promedio 
    ? parseFloat(rendimientoStats.eficiencia.diferencia_promedio) 
    : 0;
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader title="Eficiencia del Proceso" />
      <DashboardCardContent>
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tasa de Coincidencia
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={tasaMatch} 
              sx={{ height: 10, borderRadius: 5, mb: 1 }} 
            />
            <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Efectividad</span>
              <span>{tasaMatch.toFixed(1)}%</span>
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Precisión de Conteo
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={tasaPrecision} 
              color="success"
              sx={{ height: 10, borderRadius: 5, mb: 1 }} 
            />
            <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Precisión</span>
              <span>{tasaPrecision.toFixed(1)}%</span>
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Diferencia Promedio
            </Typography>
            <Typography variant="h5" color={diferenciaPromedio > 1000 ? "error" : "success"}>
              ${Math.abs(diferenciaPromedio).toFixed(2)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Valor promedio de diferencia en conciliaciones
            </Typography>
          </Box>
        </Box>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default PerformanceMetrics;