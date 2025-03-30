// src/components/dashboard-admin/ConciliationsByZone.js
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

const ConciliationsByZone = ({ data }) => {
  const theme = useTheme();
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader title="Conciliaciones por Zona" />
      <DashboardCardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zona" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar name="Máquinas Conciliadas" dataKey="conciliadas" fill={theme.palette.success.main} />
            <Bar name="Máquinas Pendientes" dataKey="pendientes" fill={theme.palette.warning.main} />
          </BarChart>
        </ResponsiveContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default ConciliationsByZone;