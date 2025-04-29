import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Encabezado del Dashboard del Tesorero con resumen de zonas
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.summary - Datos de resumen
 * @param {Number} props.summary.totalZonas - Total de zonas
 * @param {Number} props.summary.zonasConfirmadas - Zonas confirmadas
 * @param {Number} props.summary.zonasPendientes - Zonas pendientes
 * @param {Number} props.summary.totalEsperado - Total esperado ($)
 * @param {Number} props.summary.totalContado - Total contado ($)
 * @param {String} props.summary.lastUpdate - Última actualización
 * @param {Boolean} props.loading - Estado de carga
 */
const TesoreroDashboardHeader = ({ summary, loading }) => {
  // Fecha actual formateada
  const currentDate = format(new Date(), 'EEEE d', { locale: es });
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });
  
  // Formatear valores monetarios
  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  // Calcular porcentaje de confirmación
  const confirmationPercentage = summary.totalZonas > 0 
    ? (summary.zonasConfirmadas / summary.totalZonas) * 100 
    : 0;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Encabezado */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            p: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Fondos decorativos */}
          <Box 
            sx={{ 
              position: 'absolute',
              right: -50,
              top: -30,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              zIndex: 0
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute',
              right: 50,
              bottom: -40,
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              zIndex: 0
            }} 
          />
          
          {/* Contenido del encabezado */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard del Tesorero
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarIcon fontSize="small" />
              <Typography variant="h6">
                {currentDate} de {currentMonth}
              </Typography>
              <Chip 
                label={`Actualizado: ${summary.lastUpdate || 'No disponible'}`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} 
              />
            </Stack>
          </Box>
        </Box>
        
        {/* Indicador de carga */}
        {loading && (
          <LinearProgress sx={{ height: 4 }} />
        )}
        
        {/* Tarjetas de resumen */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Resumen de zonas */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Resumen de Zonas
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                          {summary.totalZonas || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="success.main">
                          {summary.zonasConfirmadas || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confirmadas
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="bold" color="warning.main">
                          {summary.zonasPendientes || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pendientes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* Barra de progreso */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progreso de confirmación
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {confirmationPercentage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={confirmationPercentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: confirmationPercentage === 100 ? 'success.main' : 'primary.main'
                        }
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Resumen financiero */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Resumen Financiero
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Esperado
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="text.primary">
                            {formatMoney(summary.totalEsperado)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Contado
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="text.primary">
                            {formatMoney(summary.totalContado)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Diferencia */}
                    <Box sx={{ 
                      p: 2, 
                      mt: 2, 
                      bgcolor: 'white', 
                      borderRadius: 2, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Diferencia
                        </Typography>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold" 
                          color={(summary.totalContado - summary.totalEsperado) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatMoney(summary.totalContado - summary.totalEsperado)}
                        </Typography>
                      </Box>
                      
                      <MoneyIcon 
                        sx={{ 
                          fontSize: 40, 
                          opacity: 0.6,
                          color: (summary.totalContado - summary.totalEsperado) >= 0 ? 'success.main' : 'error.main'
                        }} 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default TesoreroDashboardHeader;