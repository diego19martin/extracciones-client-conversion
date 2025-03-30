import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Modal component to display detailed information about a machine
 */
const MachineDetailsModal = ({ machine, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Early return if no machine data
  if (!machine) return null;
  
  const dbData = machine.dbData || {};
  
  // Format currency values
  const formatCurrency = (value) => {
    return value ? value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : '$0';
  };
  
  // Calculate denomination totals
  const calculateDenominationTotal = (denominations) => {
    if (!denominations) return 0;
    return Object.entries(denominations).reduce((total, [denom, count]) => {
      const value = parseInt(denom.replace(/[^\d]/g, ''));
      return total + (value * count);
    }, 0);
  };
  
  // Get physical bills
  const getPhysicalBills = () => {
    if (!machine.billetesFisicos || Object.keys(machine.billetesFisicos).length === 0) {
      return null;
    }
  
    const denominations = Object.keys(machine.billetesFisicos)
      .sort((a, b) => parseInt(a.replace('B', '')) - parseInt(b.replace('B', '')));
    
    const totalFisico = calculateDenominationTotal(machine.billetesFisicos);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Billetes Físicos
        </Typography>
        <Grid container spacing={1}>
          {denominations.map(denom => {
            const valor = parseInt(denom.replace('B', ''));
            const cantidad = machine.billetesFisicos[denom];
            const subtotal = valor * cantidad;
            
            if (cantidad <= 0) return null;
            
            return (
              <Grid item xs={6} sm={3} key={denom}>
                <Paper elevation={1} sx={{ p: 1, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ${valor}
                  </Typography>
                  <Typography variant="body2">
                    {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(subtotal)}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        <Typography variant="subtitle1" fontWeight="bold" align="right" sx={{ mt: 1 }}>
          Total Físico: {formatCurrency(totalFisico)}
        </Typography>
      </Box>
    );
  };
  
  // Get virtual bills
  const getVirtualBills = () => {
    if (!machine.billetesVirtuales || Object.keys(machine.billetesVirtuales).length === 0) {
      return null;
    }
  
    const denominations = Object.keys(machine.billetesVirtuales)
      .sort((a, b) => parseInt(a.replace('IM', '')) - parseInt(b.replace('IM', '')));
    
    const totalVirtual = calculateDenominationTotal(machine.billetesVirtuales);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Billetes Virtuales
        </Typography>
        <Grid container spacing={1}>
          {denominations.map(denom => {
            const valor = parseInt(denom.replace('IM', ''));
            const cantidad = machine.billetesVirtuales[denom];
            const subtotal = valor * cantidad;
            
            if (cantidad <= 0) return null;
            
            return (
              <Grid item xs={6} sm={3} key={denom}>
                <Paper elevation={1} sx={{ p: 1, textAlign: 'center', bgcolor: '#f1f8e9' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ${valor} Virtual
                  </Typography>
                  <Typography variant="body2">
                    {cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(subtotal)}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        <Typography variant="subtitle1" fontWeight="bold" align="right" sx={{ mt: 1 }}>
          Total Virtual: {formatCurrency(totalVirtual)}
        </Typography>
      </Box>
    );
  };
  
  // Get database information
  const getDatabaseInfo = () => {
    if (Object.keys(dbData).length === 0) return null;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 1 }}
        >
          <Typography variant="h6" gutterBottom color="primary">
            Datos registrados en sistema
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Bill en Sistema:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {dbData.bill ? formatCurrency(parseFloat(dbData.bill)) : '$0'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Estado:
              </Typography>
              <Typography 
                variant="body1" 
                fontWeight="medium"
                color={
                  dbData.finalizado === 'Completa' ? 'success.main' :
                  dbData.finalizado === 'Pendiente' ? 'warning.main' : 
                  'text.secondary'
                }
              >
                {dbData.finalizado || 'No registrado'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Asistente 1:
              </Typography>
              <Typography variant="body1">
                {dbData.asistente1 || 'Ninguno'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Asistente 2:
              </Typography>
              <Typography variant="body1">
                {dbData.asistente2 || 'Ninguno'}
              </Typography>
            </Grid>
            
            {dbData.comentario && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Comentario:
                </Typography>
                <Paper sx={{ p: 1, bgcolor: '#f5f5f5', mt: 0.5 }}>
                  <Typography variant="body2">
                    {dbData.comentario}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Máquina #{machine.machineId}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ px: isMobile ? 2 : 3 }}>
        {/* Basic machine info */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Número de Serie:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {machine.headercard || 'No disponible'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Ubicación:
            </Typography>
            <Typography variant="body1">
              {machine.location || 'Desconocida'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Fecha:
            </Typography>
            <Typography variant="body1">
              {machine.date || 'No disponible'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Hora:
            </Typography>
            <Typography variant="body1">
              {machine.time || 'No disponible'}
            </Typography>
          </Grid>
        </Grid>
        
        {/* Summary boxes */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={2}
              sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', height: '100%' }}
            >
              <Typography variant="body2" color="primary">Esperado:</Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(machine.expectedAmount)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={2}
              sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center', height: '100%' }}
            >
              <Typography variant="body2" color="success.main">Contado:</Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(machine.countedAmount)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                bgcolor: machine.difference >= 0 ? '#e8f5e9' : '#ffebee',
                textAlign: 'center',
                height: '100%'
              }}
            >
              <Typography
                variant="body2"
                color={machine.difference >= 0 ? 'success.main' : 'error.main'}
              >
                Diferencia:
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={machine.difference >= 0 ? 'success.main' : 'error.main'}
              >
                {machine.difference >= 0 ? '+' : ''}
                {formatCurrency(machine.difference)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Database information */}
        {getDatabaseInfo()}
        
        {/* Divider */}
        <Divider sx={{ my: 3 }} />
        
        {/* Physical bills */}
        {getPhysicalBills()}
        
        {/* Virtual bills */}
        {getVirtualBills()}
      </DialogContent>
    </Dialog>
  );
};

export default MachineDetailsModal;