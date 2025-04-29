import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Grid,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de tarjeta para mostrar información de una zona y permitir su confirmación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.zona - Datos de la zona
 * @param {Function} props.onConfirm - Función a ejecutar cuando se confirma la zona
 * @param {Function} props.onViewDetails - Función a ejecutar cuando se solicita ver detalles
 */
const ZonaCard = ({ zona, onConfirm, onViewDetails }) => {
  if (!zona) return null;

  // Calcular diferencia y estado
  const diferencia = zona.total_contado - zona.total_esperado;
  const tieneDiferencia = Math.abs(diferencia) > 0;
  const esDiferenciaPositiva = diferencia > 0;
  
  // Formatear valores monetarios
  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Formatear fecha y hora
  const formatDateTime = (date, time) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      let dateObj;
      
      if (typeof date === 'string' && date.includes('-')) {
        // Formato ISO YYYY-MM-DD
        const [year, month, day] = date.split('-');
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(date);
      }
      
      const formattedDate = format(dateObj, 'dd/MM/yyyy', { locale: es });
      return time ? `${formattedDate} ${time}` : formattedDate;
    } catch (e) {
      console.error('Error formateando fecha:', e);
      return 'Fecha inválida';
    }
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        },
        // Borde de color según estado
        borderLeft: '4px solid',
        borderColor: zona.confirmada ? 'success.main' : 'warning.main',
      }}
    >
      {/* Chip de estado en la esquina superior derecha */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Chip
          icon={zona.confirmada ? <CheckCircleIcon /> : <WarningIcon />}
          label={zona.confirmada ? "Confirmada" : "Pendiente"}
          color={zona.confirmada ? "success" : "warning"}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </Box>

      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: zona.confirmada ? 'success.light' : 'warning.light',
              color: zona.confirmada ? 'success.contrastText' : 'warning.contrastText',
              fontWeight: 'bold'
            }}
          >
            {zona.zona.toString().charAt(0)}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="div">
            Zona {zona.zona}
          </Typography>
        }
        subheader={`Conciliada por: ${zona.usuario || 'No especificado'}`}
      />

      <Divider />

      <CardContent>
        <Grid container spacing={2}>
          {/* Información principal */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              mb: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                Fecha: {formatDateTime(zona.fecha, zona.hora)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {zona.id}
              </Typography>
            </Box>
          </Grid>

          {/* Totales */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Total Esperado
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium">
                {formatMoney(zona.total_esperado)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Total Contado
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium">
                {formatMoney(zona.total_contado)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: tieneDiferencia ? (esDiferenciaPositiva ? 'success.50' : 'error.50') : 'grey.50', 
              borderRadius: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Diferencia
              </Typography>
              <Typography 
                variant="h6" 
                component="div" 
                fontWeight="medium"
                color={tieneDiferencia ? (esDiferenciaPositiva ? 'success.main' : 'error.main') : 'inherit'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {tieneDiferencia && (
                  esDiferenciaPositiva ? 
                    <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
                    <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                {formatMoney(diferencia)}
              </Typography>
            </Box>
          </Grid>

          {/* Resumen de máquinas */}
          <Grid item xs={12}>
            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Total
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" align="center">
                    {zona.maquinas_totales || 0}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Coincidentes
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" align="center" color="success.main">
                    {zona.maquinas_coincidentes || 0}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Discrepancia
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" align="center" color="error.main">
                    {zona.maquinas_discrepancia || 0}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Faltantes
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" align="center" color="warning.main">
                    {zona.maquinas_faltantes || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Comentarios (si existen) */}
        {zona.comentarios && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Comentarios:
            </Typography>
            <Typography variant="body2" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              {zona.comentarios}
            </Typography>
          </Box>
        )}

        {/* Información de confirmación (si está confirmada) */}
        {zona.confirmada && zona.usuario_confirmacion && (
          <Box sx={{ 
            mt: 2, 
            p: 1, 
            bgcolor: 'success.50', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">
                Confirmada por: <strong>{zona.usuario_confirmacion}</strong>
              </Typography>
              {zona.fecha_confirmacion && (
                <Typography variant="caption" color="text.secondary">
                  {typeof zona.fecha_confirmacion === 'string' 
                    ? zona.fecha_confirmacion 
                    : format(new Date(zona.fecha_confirmacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Tooltip title="Ver todas las máquinas de esta zona">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<VisibilityIcon />}
            onClick={() => onViewDetails && onViewDetails(zona)}
            size="small"
          >
            Ver Detalles
          </Button>
        </Tooltip>

        {!zona.confirmada && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => onConfirm && onConfirm(zona)}
            size="small"
          >
            Confirmar Recepción
          </Button>
        )}

        {zona.confirmada && (
          <Chip
            label="Confirmada"
            color="success"
            size="small"
            icon={<CheckCircleIcon />}
          />
        )}
      </CardActions>
    </Card>
  );
};

export default ZonaCard;