import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const SummaryCards = ({ summary }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
          <Typography variant="h6">Total Esperado</Typography>
          <Typography variant="h4">${summary.totalExpected.toLocaleString('es-AR')}</Typography>
          <Typography variant="body2" color="text.secondary">
            Valor que debería extraerse
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="h6">Total Contado</Typography>
          <Typography variant="h4">${summary.totalCounted.toLocaleString('es-AR')}</Typography>
          <Typography variant="body2" color="text.secondary">
            Valor efectivamente registrado
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{
          p: 2,
          textAlign: 'center',
          bgcolor: summary.totalCounted - summary.totalExpected >= 0 ? '#e8f5e9' : '#ffebee'
        }}>
          <Typography variant="h6">Diferencia</Typography>
          <Typography variant="h4" color={summary.totalCounted - summary.totalExpected >= 0 ? 'success.main' : 'error.main'}>
            {summary.totalCounted - summary.totalExpected >= 0 ? '+' : ''}
            ${(summary.totalCounted - summary.totalExpected).toLocaleString('es-AR')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {summary.totalExpected > 0
              ? `${Math.abs((summary.totalCounted / summary.totalExpected * 100) - 100).toFixed(2)}% ${summary.totalCounted >= summary.totalExpected ? 'más' : 'menos'} de lo esperado`
              : 'Sin valor esperado para comparar'}
          </Typography>
        </Paper>
      </Grid>
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
    </Grid>
  );
};

export default SummaryCards;