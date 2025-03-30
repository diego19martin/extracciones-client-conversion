// components/SummaryCards.js
import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { formatDate } from '../../utils/formatUtils';

const SummaryCards = ({ total, machines }) => {
  return (
    <>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total máquinas
            </Typography>
            <Typography variant="h4">
              {total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Máquinas conciliadas
            </Typography>
            <Typography variant="h4">
              {machines.filter(m => m.conciliado === 1).length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Máquinas con novedades
            </Typography>
            <Typography variant="h4" color="error">
              {machines.filter(m => m.tiene_novedad === 1).length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Última actualización
            </Typography>
            <Typography variant="body1">
              {machines.length > 0 && machines[0].ultima_actualizacion
                ? formatDate(machines[0].ultima_actualizacion)
                : 'Sin datos'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default SummaryCards;