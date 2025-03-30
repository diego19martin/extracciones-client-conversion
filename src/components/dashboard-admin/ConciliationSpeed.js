// src/components/dashboard-admin/ConciliationSpeed.js
import React from 'react';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const ConciliationSpeed = ({ data }) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <DashboardCard elevation={3}>
        <DashboardCardHeader title="Velocidad de Conciliación" />
        <DashboardCardContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            No hay datos de velocidad de conciliación disponibles
          </div>
        </DashboardCardContent>
      </DashboardCard>
    );
  }
  
  // Procesar datos para asegurar que los valores son numéricos
  const processedData = data.map(item => ({
    ...item,
    conciliaciones: typeof item.conciliaciones === 'string' ? parseFloat(item.conciliaciones) : item.conciliaciones,
    tiempo_promedio: typeof item.tiempo_promedio === 'string' ? parseFloat(item.tiempo_promedio) : item.tiempo_promedio
  }));
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader title="Velocidad de Conciliación" />
      <DashboardCardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="dia" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                // Asegurarse de que value es un número antes de usar toFixed
                const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                return [
                  name === 'conciliaciones' ? numericValue : `${numericValue.toFixed(1)} min`,
                  name === 'conciliaciones' ? 'Conciliaciones' : 'Tiempo Promedio'
                ];
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="conciliaciones" 
              name="Conciliaciones" 
              stroke={theme.palette.primary.main} 
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="tiempo_promedio" 
              name="Tiempo Promedio (min)" 
              stroke={theme.palette.secondary.main} 
            />
          </LineChart>
        </ResponsiveContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default ConciliationSpeed;