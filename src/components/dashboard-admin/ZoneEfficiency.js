// src/components/dashboard-admin/ZoneEfficiency.js
import React from 'react';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const ZoneEfficiency = ({ data }) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <DashboardCard elevation={3}>
        <DashboardCardHeader title="Eficiencia por Zonas" />
        <DashboardCardContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            No hay datos de eficiencia por zonas disponibles
          </div>
        </DashboardCardContent>
      </DashboardCard>
    );
  }
  
  // Procesar datos para asegurar que los valores son numéricos
  const processedData = data.map(item => ({
    ...item,
    tasa_exito: typeof item.tasa_exito === 'string' ? parseFloat(item.tasa_exito) : item.tasa_exito,
    total: typeof item.total === 'string' ? parseFloat(item.total) : item.total,
    matches: typeof item.matches === 'string' ? parseFloat(item.matches) : item.matches
  }));
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader title="Eficiencia por Zonas" />
      <DashboardCardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zona" />
            <YAxis />
            <Tooltip 
              formatter={(value) => {
                // Asegurarse de que value es un número antes de usar toFixed
                const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                return [`${numericValue.toFixed(2)}%`];
              }} 
            />
            <Legend />
            <Bar name="Tasa de Éxito (%)" dataKey="tasa_exito" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default ZoneEfficiency;