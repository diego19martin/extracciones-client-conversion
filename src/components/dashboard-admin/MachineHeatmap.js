// src/components/dashboard-admin/MachineHeatmap.js
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Tooltip, 
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn } from '@mui/icons-material';

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
  overflow: 'auto',
}));

const MachineHeatmap = ({ data }) => {
  const theme = useTheme();
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <DashboardCard elevation={3}>
        <DashboardCardHeader 
          title="Mapa de Distribución de Máquinas" 
          subheader="Visualización de máquinas por zona con intensidad según diferencia"
        />
        <DashboardCardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No hay datos disponibles para visualizar
            </Typography>
          </Box>
        </DashboardCardContent>
      </DashboardCard>
    );
  }
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader 
        title="Mapa de Distribución de Máquinas" 
        subheader="Visualización de máquinas por zona con intensidad según diferencia"
      />
      <DashboardCardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(data).map(([zone, machines]) => (
            <Box key={zone} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Zona: {zone}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                {machines.map((machine) => {
                  // Determinar color según la diferencia
                  let bgColor = theme.palette.success.light; // Por defecto, verde claro
                  
                  if (machine.value < 0) {
                    // Diferencia negativa - rojo
                    bgColor = theme.palette.error.light;
                  } else if (machine.value === 0) {
                    // Sin diferencia - verde
                    bgColor = theme.palette.success.light;
                  } else if (machine.value > 1000) {
                    // Diferencia positiva grande - amarillo
                    bgColor = theme.palette.warning.light;
                  }
                  
                  return (
                    <Tooltip 
                      key={machine.id} 
                      title={
                        <Box>
                          <Typography variant="body2">ID: {machine.id}</Typography>
                          <Typography variant="body2">Ubicación: {machine.location}</Typography>
                          <Typography variant="body2">Valor contado: ${machine.valor_contado?.toLocaleString()}</Typography>
                          <Typography variant="body2">Valor esperado: ${machine.valor_esperado?.toLocaleString()}</Typography>
                          <Typography variant="body2">Diferencia: ${machine.value.toLocaleString()}</Typography>
                        </Box>
                      }
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: bgColor,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          opacity: 0.2 + (machine.intensity / 150), // Intensidad basada en la diferencia
                          '&:hover': {
                            opacity: 1,
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Typography variant="caption">{machine.id}</Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default MachineHeatmap;