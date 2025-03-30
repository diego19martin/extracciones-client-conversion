import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography
} from '@mui/material';

const ResultsTable = ({ comparisonResults, activeTab, onRowClick, isMobile }) => {
  if (comparisonResults.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ py: 4 }}>
        No hay resultados de conciliación disponibles. Cargue ambos archivos y haga clic en "CONCILIAR CONTEO DE ZONA".
      </Typography>
    );
  }

  const filteredResults = comparisonResults.filter(row => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return row.status === 'mismatch';
    if (activeTab === 2) return row.status === 'missing';
    if (activeTab === 3) return row.status === 'extra';
    return true;
  });

  if (filteredResults.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ py: 4 }}>
        No hay resultados que coincidan con el filtro seleccionado.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440, mt: 2 }}>
      <Table stickyHeader size={isMobile ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            <TableCell>Máquina</TableCell>
            <TableCell>Número de Serie</TableCell>
            <TableCell align="right">Esperado ($)</TableCell>
            <TableCell align="right">Contado ($)</TableCell>
            <TableCell align="right">Diferencia ($)</TableCell>
            <TableCell align="center">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredResults.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                backgroundColor:
                  row.status === 'match' ? '#e8f5e9' :
                    row.status === 'mismatch' ? '#ffebee' :
                      row.status === 'missing' ? '#fff8e1' :
                        '#e0f7fa',
                '&:hover': { opacity: 0.9 },
                cursor: 'pointer'
              }}
              onClick={() => onRowClick(row)}
            >
              <TableCell>
                {row.machineId}
                {row.dbData && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      width: 16,
                      height: 16,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      ml: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                    title="Registrada en sistema"
                  >
                    DB
                  </Box>
                )}
              </TableCell>
              <TableCell>{row.headercard || '-'}</TableCell>
              <TableCell align="right">{row.expectedAmount.toLocaleString('es-AR')}</TableCell>
              <TableCell align="right">{row.countedAmount.toLocaleString('es-AR')}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: row.difference === 0 ? 'inherit' :
                    row.difference > 0 ? 'success.main' : 'error.main',
                  fontWeight: row.difference !== 0 ? 'bold' : 'normal'
                }}
              >
                {row.difference > 0 ? '+' : ''}{row.difference.toLocaleString('es-AR')}
              </TableCell>
              <TableCell align="center">
                {row.status === 'match' && '✅ Coincide'}
                {row.status === 'mismatch' && '❌ No coincide'}
                {row.status === 'missing' && '⚠️ Faltante'}
                {row.status === 'extra' && '➕ Extra'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResultsTable;