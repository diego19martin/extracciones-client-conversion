// src/components/dashboard-admin/MonthlySummary.js
import React from 'react';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const MonthlySummary = ({ data }) => {
  const theme = useTheme();
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader title="Resumen Mensual" />
      <DashboardCardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="total" 
              name="Monto Total" 
              stroke={theme.palette.primary.main} 
              fill={`${theme.palette.primary.main}50`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default MonthlySummary;