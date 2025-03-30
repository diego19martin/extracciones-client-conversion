import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { guardarConciliacionZona } from '../api/zona-conciliacion.api';
import Swal from 'sweetalert2';

const ZonaConciliacion = () => {
  // Estado para archivos
  const [datFile, setDatFile] = useState(null);
  const [xlsFile, setXlsFile] = useState(null);
  
  // Estado para datos de formulario
  const [formData, setFormData] = useState({
    zona: '',
    usuario: '',
    comentarios: ''
  });
  
  // Estado para la conciliación
  const [conciliacionData, setConciliacionData] = useState({
    totalEsperado: 0,
    totalContado: 0,
    maquinasTotales: 0,
    maquinasCoincidentes: 0,
    maquinasDiscrepancia: 0,
    maquinasFaltantes: 0,
    maquinasExtra: 0
  });
  
  // Estado para resultados de máquinas
  const [resultados, setResultados] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Manejador de cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejador para cambios en el archivo DAT
  const handleDatFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDatFile(e.target.files[0]);
      console.log('DAT File selected:', e.target.files[0].name);
    }
  };
  
  // Manejador para cambios en el archivo XLS
  const handleXlsFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setXlsFile(e.target.files[0]);
      console.log('XLS File selected:', e.target.files[0].name);
      // Aquí podrías añadir lógica para leer el archivo Excel y actualizar los resultados
    }
  };
  
  // Manejador para cambios en datos de conciliación
  const handleConciliacionChange = (e) => {
    const { name, value } = e.target;
    setConciliacionData({
      ...conciliacionData,
      [name]: parseFloat(value) || 0
    });
  };
  
  // Función para simular la lectura de un archivo Excel
  const parseExcelFile = async (file) => {
    // En un caso real, usarías una librería como xlsx o sheetjs
    console.log('Parsing Excel file (simulation)...');
    
    // Simulación de resultados
    setTimeout(() => {
      // Datos de ejemplo para testing
      const resultadosEjemplo = [
        {
          machineId: '101',
          headercard: 'HC101',
          location: 'ZONE1-A01',
          expectedAmount: 5000,
          countedAmount: 5000,
          countedPhysical: 4500,
          countedVirtual: 500,
          status: 'MATCH',
          billetesFisicos: {
            '100': 45
          },
          billetesVirtuales: {
            '100': 5
          }
        },
        {
          machineId: '102',
          headercard: 'HC102',
          location: 'ZONE1-A02',
          expectedAmount: 3000,
          countedAmount: 2800,
          countedPhysical: 2800,
          countedVirtual: 0,
          status: 'DISCREPANCY',
          billetesFisicos: {
            '100': 28
          },
          billetesVirtuales: {}
        }
      ];
      
      setResultados(resultadosEjemplo);
      
      // Actualizar resumen de conciliación
      setConciliacionData({
        totalEsperado: 8000,
        totalContado: 7800,
        maquinasTotales: 2,
        maquinasCoincidentes: 1,
        maquinasDiscrepancia: 1,
        maquinasFaltantes: 0,
        maquinasExtra: 0
      });
      
      console.log('Excel parsing completed (simulated)');
    }, 1000);
  };
  
  // Efecto para procesar el archivo Excel cuando se selecciona
  useEffect(() => {
    if (xlsFile) {
      parseExcelFile(xlsFile);
    }
  }, [xlsFile]);
  
  // Validación antes del envío
  const validateForm = () => {
    if (!formData.zona) {
      setError('Debe ingresar un número o nombre de zona');
      return false;
    }
    
    if (!formData.usuario) {
      setError('Debe ingresar un nombre de usuario');
      return false;
    }
    
    if (resultados.length === 0) {
      setError('No hay resultados de máquinas para enviar');
      return false;
    }
    
    return true;
  };
  
  // Manejo de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Construir objeto con todos los datos
      const dataToSend = {
        zona: formData.zona,
        usuario: formData.usuario,
        comentarios: formData.comentarios,
        totalEsperado: conciliacionData.totalEsperado,
        totalContado: conciliacionData.totalContado,
        maquinasTotales: conciliacionData.maquinasTotales,
        maquinasCoincidentes: conciliacionData.maquinasCoincidentes,
        maquinasDiscrepancia: conciliacionData.maquinasDiscrepancia,
        maquinasFaltantes: conciliacionData.maquinasFaltantes,
        maquinasExtra: conciliacionData.maquinasExtra,
        resultados: resultados,
        confirmada: false
      };
      
      console.log('Sending data to server:', JSON.stringify(dataToSend, null, 2));
      
      // Enviar datos y archivos al servidor
      const response = await guardarConciliacionZona(dataToSend, datFile, xlsFile);
      
      console.log('Server response:', response);
      
      if (response.data && response.data.success) {
        setSuccess(true);
        Swal.fire({
          icon: 'success',
          title: 'Conciliación guardada',
          text: `La conciliación de la zona ${formData.zona} ha sido guardada correctamente.`,
          footer: `ID: ${response.data.id}`
        });
        
        // Limpiar formulario después de éxito
        setFormData({
          zona: '',
          usuario: '',
          comentarios: ''
        });
        setDatFile(null);
        setXlsFile(null);
        setResultados([]);
        setConciliacionData({
          totalEsperado: 0,
          totalContado: 0,
          maquinasTotales: 0,
          maquinasCoincidentes: 0,
          maquinasDiscrepancia: 0,
          maquinasFaltantes: 0,
          maquinasExtra: 0
        });
      } else {
        throw new Error('La respuesta del servidor no indica éxito');
      }
    } catch (error) {
      console.error('Error al guardar conciliación:', error);
      
      let errorMessage = 'Ocurrió un error al guardar la conciliación.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cerrar alerta de éxito
  const handleCloseSuccess = () => {
    setSuccess(false);
  };
  
  // Cerrar alerta de error
  const handleCloseError = () => {
    setError(null);
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Conciliación de Zona
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. Información de la Zona
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Número de Zona"
              name="zona"
              value={formData.zona}
              onChange={handleFormChange}
              placeholder="Ej: ZONA1, ZONA2..."
              helperText="Ingrese el identificador de la zona"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleFormChange}
              placeholder="Su nombre de usuario"
              helperText="Ingrese su nombre de usuario"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="confirmada-label">Estado</InputLabel>
              <Select
                labelId="confirmada-label"
                id="confirmada"
                value="pendiente"
                label="Estado"
                disabled
              >
                <MenuItem value="pendiente">Pendiente de confirmación</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comentarios (opcional)"
              name="comentarios"
              value={formData.comentarios}
              onChange={handleFormChange}
              placeholder="Comentarios adicionales sobre esta conciliación..."
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          2. Archivos de Conciliación
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Archivo DAT
                </Typography>
                
                <Box sx={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#f9f9f9'
                }}>
                  {datFile ? (
                    <>
                      <Typography variant="body1" gutterBottom color="primary">
                        {datFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(datFile.size / 1024).toFixed(2)} KB
                      </Typography>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => setDatFile(null)}
                        sx={{ mt: 1 }}
                      >
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <CloudUploadIcon fontSize="large" color="action" />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Arrastra aquí el archivo DAT o
                      </Typography>
                      <Button
                        component="label"
                        variant="contained"
                        sx={{ mt: 1 }}
                      >
                        Seleccionar archivo
                        <input
                          type="file"
                          accept=".dat"
                          hidden
                          onChange={handleDatFileChange}
                        />
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Archivo Excel
                </Typography>
                
                <Box sx={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#f9f9f9'
                }}>
                  {xlsFile ? (
                    <>
                      <Typography variant="body1" gutterBottom color="primary">
                        {xlsFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(xlsFile.size / 1024).toFixed(2)} KB
                      </Typography>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => setXlsFile(null)}
                        sx={{ mt: 1 }}
                      >
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <CloudUploadIcon fontSize="large" color="action" />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Arrastra aquí el archivo Excel o
                      </Typography>
                      <Button
                        component="label"
                        variant="contained"
                        sx={{ mt: 1 }}
                      >
                        Seleccionar archivo
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          hidden
                          onChange={handleXlsFileChange}
                        />
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          3. Resumen de Conciliación
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Total Esperado ($)"
              name="totalEsperado"
              value={conciliacionData.totalEsperado}
              onChange={handleConciliacionChange}
              InputProps={{
                startAdornment: '$',
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Total Contado ($)"
              name="totalContado"
              value={conciliacionData.totalContado}
              onChange={handleConciliacionChange}
              InputProps={{
                startAdornment: '$',
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Máquinas Coincidentes"
              name="maquinasCoincidentes"
              value={conciliacionData.maquinasCoincidentes}
              onChange={handleConciliacionChange}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Máquinas con Discrepancia"
              name="maquinasDiscrepancia"
              value={conciliacionData.maquinasDiscrepancia}
              onChange={handleConciliacionChange}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Total de Máquinas"
              name="maquinasTotales"
              value={conciliacionData.maquinasTotales}
              onChange={handleConciliacionChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Máquinas Faltantes"
              name="maquinasFaltantes"
              value={conciliacionData.maquinasFaltantes}
              onChange={handleConciliacionChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Máquinas Extra"
              name="maquinasExtra"
              value={conciliacionData.maquinasExtra}
              onChange={handleConciliacionChange}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Diferencia: ${(conciliacionData.totalContado - conciliacionData.totalEsperado).toFixed(2)}
          </Typography>
          
          {resultados.length > 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Se han cargado {resultados.length} resultados de máquinas.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No hay resultados de máquinas cargados. Suba un archivo Excel para generar resultados.
            </Alert>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={loading || resultados.length === 0}
          sx={{ py: 1.5, px: 4 }}
        >
          {loading ? "GUARDANDO..." : "GUARDAR CONCILIACIÓN"}
        </Button>
      </Box>
      
      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Conciliación guardada correctamente
        </Alert>
      </Snackbar>
      
      {/* Snackbar para mensajes de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Sección para debugging en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Debugging (solo en desarrollo)
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Datos del formulario:
          </Typography>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto' 
          }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
          
          <Typography variant="subtitle2" gutterBottom>
            Datos de conciliación:
          </Typography>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto' 
          }}>
            {JSON.stringify(conciliacionData, null, 2)}
          </pre>
          
          <Typography variant="subtitle2" gutterBottom>
            Resultados ({resultados.length}):
          </Typography>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto' 
          }}>
            {JSON.stringify(resultados, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default ZonaConciliacion;