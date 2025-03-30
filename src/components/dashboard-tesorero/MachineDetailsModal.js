// components/MachineDetailsModal.js
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  Typography, 
  Divider, 
  Box, 
  Paper 
} from '@mui/material';
import StatusChip from './StatusChip';
import { formatDate, formatCurrency } from '../../utils/formatUtils';

const MachineDetailsModal = ({ open, machine, onClose }) => {
  if (!machine) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalles de Máquina {machine.maquina}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Información general */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Máquina
                </Typography>
                <Typography variant="body1">
                  {machine.maquina}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Headercard
                </Typography>
                <Typography variant="body1">
                  {machine.headercard || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Ubicación
                </Typography>
                <Typography variant="body1">
                  {machine.location || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Zona
                </Typography>
                <Typography variant="body1">
                  {machine.zona || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Bill
                </Typography>
                <Typography variant="body1">
                  ${formatCurrency(machine.bill)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Moneda
                </Typography>
                <Typography variant="body1">
                  {machine.moneda || 'Pesos'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Información de conciliación */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Información de Conciliación
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Valor Esperado
                </Typography>
                <Typography variant="body1">
                  ${formatCurrency(machine.valor_esperado)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Valor Contado
                </Typography>
                <Typography variant="body1">
                  ${formatCurrency(machine.valor_contado)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Diferencia
                </Typography>
                <Typography 
                  variant="body1"
                  color={
                    machine.diferencia < 0 ? 'error' :
                    machine.diferencia > 0 ? 'success.main' : 'inherit'
                  }
                >
                  ${formatCurrency(machine.diferencia)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Estado
                </Typography>
                <Typography variant="body1">
                  <StatusChip status={machine.estado} />
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Finalizado
                </Typography>
                <Typography variant="body1">
                  {machine.finalizado || 'No iniciado'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Conciliado
                </Typography>
                <Typography variant="body1">
                  {machine.conciliado === 1 ? 'Sí' : 'No'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Información de personal */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Información de Personal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Asistente 1
                </Typography>
                <Typography variant="body1">
                  {machine.asistente1 || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Asistente 2
                </Typography>
                <Typography variant="body1">
                  {machine.asistente2 || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Usuario Conciliación
                </Typography>
                <Typography variant="body1">
                  {machine.usuario_conciliacion || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Fechas */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fechas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Fecha Extracción
                </Typography>
                <Typography variant="body1">
                  {machine.fecha_extraccion ? 
                    formatDate(machine.fecha_extraccion) : 
                    'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Fecha Conciliación
                </Typography>
                <Typography variant="body1">
                  {machine.fecha_conciliacion ? 
                    formatDate(machine.fecha_conciliacion) : 
                    'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Última Actualización
                </Typography>
                <Typography variant="body1">
                  {machine.ultima_actualizacion ? 
                    formatDate(machine.ultima_actualizacion) : 
                    'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Comentarios */}
          {machine.comentario && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comentarios / Novedades
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Paper elevation={1} sx={{ p: 2, bgcolor: machine.tiene_novedad === 1 ? 'rgba(255, 0, 0, 0.05)' : 'background.paper' }}>
                <Typography variant="body1">
                  {machine.comentario}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MachineDetailsModal;