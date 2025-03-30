// src/components/dashboard-admin/AlertsSection.js
import React from 'react';
import { Box, Typography, Alert, AlertTitle } from '@mui/material';
import { styled } from '@mui/material/styles';

const AlertContainer = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[2],
}));

const AlertsSection = ({ alertas }) => {
  if (!alertas || alertas.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Alertas y Notificaciones
      </Typography>
      
      {alertas.map((alerta, index) => (
        <AlertContainer 
          key={index} 
          severity={alerta.tipo || 'info'}
          variant="filled"
          sx={{ mb: 1 }}
        >
          <AlertTitle>{alerta.titulo}</AlertTitle>
          {alerta.mensaje}
        </AlertContainer>
      ))}
    </Box>
  );
};

export default AlertsSection;