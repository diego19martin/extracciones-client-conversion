// src/components/dashboard-admin/ZonesSummaryTable.js
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
  Tooltip,
  useTheme
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

const ZonesSummaryTable = ({ zonas, onGenerateReport }) => {
  const theme = useTheme();
  
  if (!zonas || zonas.length === 0) {
    return (
      <DashboardCard elevation={3}>
        <DashboardCardHeader 
          title="Resumen Detallado por Zonas" 
          action={
            <Tooltip title="Exportar">
              <IconButton size="small" onClick={onGenerateReport}>
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
                  <TableCell align="center">Total Máquinas</TableCell>
                  <TableCell align="right">Total Contado ($)</TableCell>
                  <TableCell align="right">Total Esperado ($)</TableCell>
                  <TableCell align="right">Diferencia ($)</TableCell>
                  <TableCell align="center">Diferencia (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} align="center">No hay datos de resumen por zonas disponibles</TableCell>
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
        title="Resumen Detallado por Zonas" 
        action={
          <Tooltip title="Exportar">
            <IconButton size="small" onClick={onGenerateReport}>
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
                <TableCell align="center">Total Máquinas</TableCell>
                <TableCell align="right">Total Contado ($)</TableCell>
                <TableCell align="right">Total Esperado ($)</TableCell>
                <TableCell align="right">Diferencia ($)</TableCell>
                <TableCell align="center">Diferencia (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zonas.map((zona, index) => {
                const diferenciaPercent = zona.total_esperado > 0 
                  ? Math.abs(zona.diferencia / zona.total_esperado * 100) 
                  : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell>{zona.zona}</TableCell>
                    <TableCell align="center">{zona.total_maquinas}</TableCell>
                    <TableCell align="right">${zona.total_contado?.toLocaleString()}</TableCell>
                    <TableCell align="right">${zona.total_esperado?.toLocaleString()}</TableCell>
                    <TableCell align="right" 
                      sx={{ 
                        color: zona.diferencia < 0 
                          ? theme.palette.error.main 
                          : zona.diferencia > 0 
                            ? theme.palette.warning.main 
                            : theme.palette.success.main 
                      }}
                    >
                      ${zona.diferencia?.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${diferenciaPercent.toFixed(2)}%`}
                        size="small"
                        color={
                          diferenciaPercent > 5 ? 'error' :
                          diferenciaPercent > 2 ? 'warning' : 'success'
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DashboardCardContent>
    </DashboardCard>
  );
};

export default ZonesSummaryTable;