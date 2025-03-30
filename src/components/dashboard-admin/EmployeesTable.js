// src/components/dashboard-admin/EmployeesTable.js
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

const EmployeesTable = ({ empleados }) => {
  if (!empleados || empleados.length === 0) {
    return (
      <DashboardCard elevation={3}>
        <DashboardCardHeader title="Top Empleados" />
        <Divider />
        <DashboardCardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Empleado</TableCell>
                  <TableCell align="center">Conciliaciones</TableCell>
                  <TableCell align="center">Extracciones</TableCell>
                  <TableCell align="right">Monto Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center">No hay datos de empleados disponibles</TableCell>
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
        title="Top Empleados" 
        action={
          <Tooltip title="Ver todos">
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
                <TableCell>Empleado</TableCell>
                <TableCell align="center">Conciliaciones</TableCell>
                <TableCell align="center">Extracciones</TableCell>
                <TableCell align="right">Monto Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empleados.map((empleado, index) => (
                <TableRow key={index}>
                  <TableCell>{empleado.nombre}</TableCell>
                  <TableCell align="center">{empleado.conciliaciones}</TableCell>
                  <TableCell align="center">{empleado.extracciones}</TableCell>
                  <TableCell align="right">${empleado.monto.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default EmployeesTable;