import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Box,
  Button,
  Typography,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';

/**
 * Componente para seleccionar zonas del casino
 * @param {Object} props - Propiedades del componente
 * @param {String} props.value - Valor seleccionado actualmente
 * @param {Function} props.onChange - Función llamada cuando cambia la selección
 * @param {Boolean} props.required - Si el campo es requerido
 * @param {Boolean} props.disabled - Si el campo está deshabilitado
 */
const ZoneSelector = ({ value, onChange, required = false, disabled = false }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newZoneDialog, setNewZoneDialog] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneError, setNewZoneError] = useState('');
  
  // Opciones predefinidas de zonas
  const predefinedZones = [
    { id: 'ZONA1', name: 'Zona 1 - Entrada Principal' },
    { id: 'ZONA2', name: 'Zona 2 - Área Central' },
    { id: 'ZONA3', name: 'Zona 3 - Área VIP' },
    { id: 'ZONA4', name: 'Zona 4 - Slots Premium' },
    { id: 'ZONA5', name: 'Zona 5 - Sector Oeste' },
    { id: 'ZONA6', name: 'Zona 6 - Sector Este' },
    { id: 'ZONA7', name: 'Zona 7 - Food Court' },
    { id: 'ZONA8', name: 'Zona 8 - Salón Privado' }
  ];
  
  // Cargar zonas disponibles al montar el componente
  useEffect(() => {
    // Aquí podrías cargar zonas desde el backend si es necesario
    const loadZones = async () => {
      try {
        // Simulación: En un caso real, cargarías desde la API
        // const response = await axios.get('/api/zones');
        // setZones(response.data);
        
        // Por ahora, usamos zonas predefinidas
        setZones(predefinedZones);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadZones();
  }, []);
  
  // Manejar cambio de selección
  const handleChange = (event) => {
    if (event.target.value === 'new') {
      setNewZoneDialog(true);
    } else {
      onChange(event.target.value);
    }
  };
  
  // Cerrar diálogo de nueva zona
  const handleCloseDialog = () => {
    setNewZoneDialog(false);
    setNewZoneName('');
    setNewZoneError('');
  };
  
  // Confirmar creación de nueva zona
  const handleConfirmNewZone = () => {
    if (!newZoneName.trim()) {
      setNewZoneError('El nombre de la zona no puede estar vacío');
      return;
    }
    
    // Crear ID a partir del nombre (simplificado)
    const zoneId = `ZONA${zones.length + 1}`;
    
    // Crear nueva zona
    const newZone = {
      id: zoneId,
      name: newZoneName.trim()
    };
    
    // Actualizar lista de zonas
    setZones([...zones, newZone]);
    
    // Seleccionar la nueva zona
    onChange(zoneId);
    
    // Cerrar diálogo
    handleCloseDialog();
    
    // En un caso real, enviarías la nueva zona al backend
    // await axios.post('/api/zones', newZone);
  };
  
  // Encontrar el nombre de la zona seleccionada
  const getSelectedZoneName = () => {
    if (!value) return '';
    const selectedZone = zones.find(zone => zone.id === value);
    return selectedZone ? selectedZone.name : '';
  };
  
  return (
    <Box>
      <FormControl fullWidth variant="outlined" disabled={disabled} required={required}>
        <InputLabel id="zona-select-label">Zona a Conciliar</InputLabel>
        <Select
          labelId="zona-select-label"
          id="zona-select"
          value={value}
          label="Zona a Conciliar"
          onChange={handleChange}
        >
          <MenuItem value="" disabled>
            Seleccione una zona
          </MenuItem>
          
          {zones.map((zone) => (
            <MenuItem key={zone.id} value={zone.id}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RoomIcon sx={{ mr: 1, color: 'primary.main' }} />
                {zone.name}
              </Box>
            </MenuItem>
          ))}
          
          <MenuItem value="new" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            <AddCircleOutlineIcon sx={{ mr: 1 }} /> Crear nueva zona
          </MenuItem>
        </Select>
      </FormControl>
      
      {value && (
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 1, 
            p: 1, 
            bgcolor: 'primary.lightest', 
            border: '1px solid', 
            borderColor: 'primary.light',
            borderRadius: 1
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Zona seleccionada:
          </Typography>
          <Typography 
            variant="body1" 
            color="primary"
            sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
          >
            <RoomIcon sx={{ mr: 0.5 }} />
            {getSelectedZoneName()}
          </Typography>
        </Paper>
      )}
      
      {/* Diálogo para nueva zona (simplificado) */}
      {newZoneDialog && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Crear nueva zona
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            id="zone-name"
            label="Nombre de la zona"
            fullWidth
            variant="outlined"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            error={!!newZoneError}
            helperText={newZoneError}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleConfirmNewZone} variant="contained">
              Crear
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ZoneSelector;