import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';

const DatabaseInfoPanel = ({ listaFiltrada, loadingListado }) => {
  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9fafe' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Información de la Base de Datos
          </Typography>
        </Box>
        {loadingListado ? (
          <Chip
            label="Cargando datos..."
            color="primary"
            sx={{ fontWeight: 'bold' }}
            icon={<CircularProgress size={16} color="inherit" />}
          />
        ) : (
          <Chip
            label={`${listaFiltrada.length} máquinas cargadas`}
            color="success"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>

      {loadingListado ? (
        <LinearProgress sx={{ mt: 1, mb: 2 }} />
      ) : (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Máquinas Completadas</Typography>
                <Typography variant="h6" color="success.main">
                  {listaFiltrada.filter(m => m.finalizado === 'Completa').length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, bgcolor: '#fff8e1', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Máquinas Pendientes</Typography>
                <Typography variant="h6" color="warning.main">
                  {listaFiltrada.filter(m => m.finalizado === 'Pendiente').length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Sin Extraer</Typography>
                <Typography variant="h6" color="error.main">
                  {listaFiltrada.filter(m => !m.finalizado).length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 1, bgcolor: '#e0f7fa', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Con Comentarios</Typography>
                <Typography variant="h6" color="info.main">
                  {listaFiltrada.filter(m => m.comentario && m.comentario.trim() !== '').length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <Typography variant="body2" color="text.secondary">
        Los datos de la base de datos se utilizarán para enriquecer la información de conciliación del conteo de zona.
      </Typography>
    </Paper>
  );
};

export default DatabaseInfoPanel;