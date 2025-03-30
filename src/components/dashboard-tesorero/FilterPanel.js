// components/FilterPanel.js
import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button 
} from '@mui/material';

const FilterPanel = ({ 
  filters, 
  zonaOptions, 
  handleFilterChange, 
  handleClearFilters, 
  handleApplyFilters 
}) => {
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filtros
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Zona</InputLabel>
            <Select
              name="zona"
              value={filters.zona}
              onChange={handleFilterChange}
              label="Zona"
            >
              <MenuItem value="">Todas</MenuItem>
              {zonaOptions.map(zona => (
                <MenuItem key={zona} value={zona}>{zona}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Completa">Completa</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="No iniciado">No iniciado</MenuItem>
              <MenuItem value="MATCH">Coincidente</MenuItem>
              <MenuItem value="DISCREPANCY">Discrepancia</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Conciliado</InputLabel>
            <Select
              name="conciliado"
              value={filters.conciliado}
              onChange={handleFilterChange}
              label="Conciliado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="1">Conciliados</MenuItem>
              <MenuItem value="0">No conciliados</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Novedades</InputLabel>
            <Select
              name="tiene_novedad"
              value={filters.tiene_novedad}
              onChange={handleFilterChange}
              label="Novedades"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="1">Con novedades</MenuItem>
              <MenuItem value="0">Sin novedades</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Fecha desde"
            type="date"
            name="fecha_inicio"
            value={filters.fecha_inicio}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Fecha hasta"
            type="date"
            name="fecha_fin"
            value={filters.fecha_fin}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} sm={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
            sx={{ mr: 1 }}
          >
            Limpiar filtros
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
          >
            Aplicar filtros
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterPanel;