import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL
  : process.env.REACT_APP_HOST_LOCAL;

const TesoreroSummary = () => {
  const [summary, setSummary] = useState({
    totalMachines: 0,
    totalExpected: 0,
    totalCounted: 0,
    difference: 0,
    percentageDifference: 0,
    confirmedZones: 0,
    matchingMachines: 0,
    nonMatchingMachines: 0,
    missingMachines: 0,
    extraMachines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Usar el endpoint correcto que ya existe
      const response = await axios.get(`${API_URL}/api/zonas-tesorero`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Datos de zonas recibidos:", response.data);
        
        // Filtrar zonas confirmadas
        const confirmedZones = response.data.filter(zone => zone.confirmada === 1);
        console.log("Zonas confirmadas:", confirmedZones);
        
        if (confirmedZones.length > 0) {
          // Calcular totales con verificación de números
          const totalExpected = confirmedZones.reduce((sum, zone) => {
            const value = parseFloat(zone.total_esperado || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const totalCounted = confirmedZones.reduce((sum, zone) => {
            const value = parseFloat(zone.total_contado || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const difference = totalCounted - totalExpected;
          const percentageDifference = totalExpected > 0 
            ? ((totalCounted / totalExpected) * 100) - 100 
            : 0;
          
          // Calcular total de máquinas con verificación de números
          const totalMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_totales || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const matchingMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_coincidentes || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const nonMatchingMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_discrepancia || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const missingMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_faltantes || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const extraMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_extra || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          // Actualizar el estado con los valores calculados
          setSummary({
            totalMachines,
            totalExpected,
            totalCounted,
            difference,
            percentageDifference,
            confirmedZones: confirmedZones.length,
            matchingMachines,
            nonMatchingMachines,
            missingMachines,
            extraMachines
          });
          
          console.log("Resumen calculado:", {
            totalMachines,
            totalExpected,
            totalCounted,
            difference,
            percentageDifference,
            confirmedZones: confirmedZones.length,
            matchingMachines,
            nonMatchingMachines,
            missingMachines,
            extraMachines
          });
        } else {
          console.log("No hay zonas confirmadas");
          // Mantener los valores en cero cuando no hay zonas confirmadas
          setSummary({
            totalMachines: 0,
            totalExpected: 0,
            totalCounted: 0,
            difference: 0,
            percentageDifference: 0,
            confirmedZones: 0,
            matchingMachines: 0,
            nonMatchingMachines: 0,
            missingMachines: 0,
            extraMachines: 0
          });
        }
      } else {
        console.warn("La respuesta no contiene un array de zonas");
        // Mantener los valores en cero cuando no hay datos
        setSummary({
          totalMachines: 0,
          totalExpected: 0,
          totalCounted: 0,
          difference: 0,
          percentageDifference: 0,
          confirmedZones: 0,
          matchingMachines: 0,
          nonMatchingMachines: 0,
          missingMachines: 0,
          extraMachines: 0
        });
      }
    } catch (error) {
      console.error('Error al obtener resumen del tesorero:', error);
      // Mantener los valores en cero en caso de error
      setSummary({
        totalMachines: 0,
        totalExpected: 0,
        totalCounted: 0,
        difference: 0,
        percentageDifference: 0,
        confirmedZones: 0,
        matchingMachines: 0,
        nonMatchingMachines: 0,
        missingMachines: 0,
        extraMachines: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Total Esperado */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
          <Typography variant="h6">Total Esperado</Typography>
          <Typography variant="h4">${summary.totalExpected.toLocaleString('es-AR')}</Typography>
          <Typography variant="body2" color="text.secondary">
            Valor que debería extraerse
          </Typography>
        </Paper>
      </Grid>
      
      {/* Total Contado */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="h6">Total Contado</Typography>
          <Typography variant="h4">${summary.totalCounted.toLocaleString('es-AR')}</Typography>
          <Typography variant="body2" color="text.secondary">
            Valor efectivamente registrado
          </Typography>
        </Paper>
      </Grid>
      
      {/* Diferencia */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{
          p: 2,
          textAlign: 'center',
          bgcolor: summary.difference >= 0 ? '#e8f5e9' : '#ffebee'
        }}>
          <Typography variant="h6">Diferencia</Typography>
          <Typography variant="h4" color={summary.difference >= 0 ? 'success.main' : 'error.main'}>
            {summary.difference >= 0 ? '+' : ''}
            ${Math.abs(summary.difference).toLocaleString('es-AR')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {summary.totalExpected > 0
              ? `${Math.abs(summary.percentageDifference).toFixed(2)}% ${summary.difference >= 0 ? 'más' : 'menos'} de lo esperado`
              : 'Sin valor esperado para comparar'}
          </Typography>
        </Paper>
      </Grid>
      
      {/* Máquinas */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#e0f7fa' }}>
          <Typography variant="h6">Máquinas</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box>
              <Typography variant="body2">Coinciden</Typography>
              <Typography variant="h6" color="success.main">{summary.matchingMachines}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Difieren</Typography>
              <Typography variant="h6" color="error.main">{summary.nonMatchingMachines}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
            <Box>
              <Typography variant="body2">Faltantes</Typography>
              <Typography variant="h6" color="warning.main">{summary.missingMachines}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Extra</Typography>
              <Typography variant="h6" color="info.main">{summary.extraMachines}</Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      {/* Zonas Confirmadas - Opcional */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
          <Typography variant="h6" gutterBottom>Zonas Confirmadas por Tesorero</Typography>
          <Typography variant="h3">{summary.confirmedZones}</Typography>
          <Typography variant="body2" color="text.secondary">
            Total de zonas procesadas y confirmadas
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TesoreroSummary;