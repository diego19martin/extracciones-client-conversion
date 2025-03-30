// src/components/dashboard-admin/MainMetrics.js
import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';
import { AccountBalance, Assessment, BusinessCenter, Equalizer } from '@mui/icons-material';
import MetricCard from './MetricCard';

const MainMetrics = ({ stats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Máquinas"
          value={stats.totalMaquinas}
          icon={<BusinessCenter />}
          color={theme.palette.primary.main}
          subtitle="Máquinas en sistema"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Máquinas Conciliadas"
          value={stats.maquinasConciliadas}
          icon={<Assessment />}
          color={theme.palette.success.main}
          subtitle={`De ${stats.maquinasExtraccion} en extracción`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Monto Total"
          value={`$${parseFloat(stats.montoTotal).toLocaleString()}`}
          icon={<AccountBalance />}
          color={theme.palette.info.main}
          subtitle="Dinero conciliado"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Diferencia"
          value={`$${Math.abs(parseFloat(stats.diferenciaTotal)).toLocaleString()}`}
          icon={<Equalizer />}
          color={parseFloat(stats.diferenciaTotal) < 0 ? theme.palette.error.main : theme.palette.warning.main}
          subtitle={parseFloat(stats.diferenciaTotal) < 0 ? "Faltante" : "Sobrante"}
        />
      </Grid>
    </Grid>
  );
};

export default MainMetrics;