// components/MachinesTable.js
import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Tooltip, 
  Chip, 
  CircularProgress, 
  Alert, 
  Pagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StatusChip from './StatusChip';
import { formatCurrency } from '../../utils/formatUtils';

const MachinesTable = ({ 
  machines, 
  loading, 
  error, 
  total, 
  page, 
  limit, 
  handlePageChange, 
  handleViewDetails 
}) => {
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Máquinas ({machines.length} / {total})
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : machines.length === 0 ? (
        <Alert severity="info">
          No se encontraron datos con los filtros aplicados.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Máquina</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Zona</TableCell>
                <TableCell align="right">Valor Esperado</TableCell>
                <TableCell align="right">Valor Contado</TableCell>
                <TableCell align="right">Diferencia</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Conciliado</TableCell>
                <TableCell>Novedad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {machines.map((machine) => (
                <TableRow key={machine.id} hover sx={{
                  backgroundColor: machine.tiene_novedad === 1 ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                }}>
                  <TableCell>{machine.maquina}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>{machine.zona}</TableCell>
                  <TableCell align="right">
                    ${formatCurrency(machine.valor_esperado)}
                  </TableCell>
                  <TableCell align="right">
                    ${formatCurrency(machine.valor_contado)}
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: machine.diferencia < 0 ? 'error.main' : 
                            machine.diferencia > 0 ? 'success.main' : 'inherit'
                  }}>
                    ${formatCurrency(machine.diferencia)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={machine.estado} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small"
                      color={machine.conciliado === 1 ? 'success' : 'default'}
                      label={machine.conciliado === 1 ? 'Sí' : 'No'}
                    />
                  </TableCell>
                  <TableCell>
                    {machine.tiene_novedad === 1 && (
                      <Tooltip title={machine.comentario || 'Tiene novedad'}>
                        <WarningAmberIcon color="error" fontSize="small" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => handleViewDetails(machine)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Paper>
  );
};

export default MachinesTable;