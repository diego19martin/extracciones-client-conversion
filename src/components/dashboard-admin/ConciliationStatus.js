// src/components/dashboard-admin/ConciliationStatus.js
import React, { useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import CircularProgressWithLabel from './CircularProgressWithLabel';

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

const ConciliationStatus = ({ stats, isMobile }) => {
  const theme = useTheme();
  
  // Datos para el gráfico de estado de conciliaciones
  const pieChartData = useMemo(() => ([
    { name: 'Conciliadas', value: stats.maquinasConciliadas },
    { name: 'Pendientes', value: stats.maquinasPendientes }
  ]), [stats.maquinasConciliadas, stats.maquinasPendientes]);
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader title="Estado de Conciliaciones" />
      <DashboardCardContent>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-around', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: isMobile ? 3 : 0 }}>
            <CircularProgressWithLabel 
              value={stats.porcentajeConciliacion} 
              color={theme.palette.primary.main}
              size={isMobile ? 120 : 160}
              thickness={isMobile ? 8 : 10}
            />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Progreso General
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {stats.maquinasConciliadas} de {stats.maquinasExtraccion} máquinas conciliadas
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', width: isMobile ? '100%' : '50%', mt: isMobile ? 2 : 0 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? theme.palette.success.main : theme.palette.warning.main} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default ConciliationStatus;