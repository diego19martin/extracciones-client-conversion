// src/components/dashboard-admin/ConciliationTable.js
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GetApp } from '@mui/icons-material';

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

const ConciliationTable = ({ conciliaciones }) => {
  if (!conciliaciones || conciliaciones.length === 0) {
    return (
      <DashboardCard elevation={3}>
        <DashboardCardHeader title="Últimas Conciliaciones" />
        <Divider />
        <DashboardCardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Zona</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay conciliaciones disponibles</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCardContent>
      </DashboardCard>
    );
  }
  
  return (
    <DashboardCard elevation={3}>
      <DashboardCardHeader 
        title="Últimas Conciliaciones" 
        action={
          <Tooltip title="Ver todas">
            <IconButton size="small">
              <GetApp />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <DashboardCardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Zona</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conciliaciones.map((conciliacion, index) => (
                <TableRow key={index}>
                  <TableCell>{conciliacion.zona}</TableCell>
                  <TableCell>{new Date(conciliacion.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{conciliacion.usuario}</TableCell>
                  <TableCell align="right">${conciliacion.monto.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={conciliacion.confirmada ? 'Confirmada' : 'Pendiente'} 
                      color={conciliacion.confirmada ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default ConciliationTable;