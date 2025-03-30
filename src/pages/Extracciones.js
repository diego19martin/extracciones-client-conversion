import React from 'react'
import { Header } from '../components/Header'
import { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Backdrop
} from '@mui/material';
import TablaMaquinas from '../components/TablaMaquinas';
import { getInfo, getEmpleados } from '../api/conversion.api';
import Select from 'react-select';
import Swal from 'sweetalert2';

// Datos locales de respaldo ya definidos en conversion.api.js

export const Extracciones = () => {
  const [infoMaquinas, setInfoMaquinas] = useState(['']);
  const [maquina, setMaquina] = useState('');
  const [extracciones, setExtracciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    // Cargar empleados desde el servidor
    const fetchEmpleados = async () => {
      setLoadingEmpleados(true);
      setConnectionStatus('checking');
      
      try {
        console.log('Cargando empleados...');
        const empleadosFormateados = await getEmpleados();
        
        if (empleadosFormateados && Array.isArray(empleadosFormateados) && empleadosFormateados.length > 0) {
          console.log(`Empleados cargados: ${empleadosFormateados.length}`);
          setEmpleados(empleadosFormateados);
          setConnectionStatus('connected');
        } else {
          console.warn('No se recibieron datos de empleados válidos');
          setErrorMessage('No se pudieron cargar los empleados. Usando datos predefinidos.');
          setShowError(true);
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.error('Error al obtener empleados:', error);
        setErrorMessage('Error al cargar empleados: ' + (error.message || 'Error de conexión'));
        setShowError(true);
        setConnectionStatus('disconnected');
      } finally {
        setLoadingEmpleados(false);
      }
    };

    fetchEmpleados();
  }, []);

  const handleChange = event => {
    if (extracciones.length >= 2) {
      setMaquina(event.target.value);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Atención!',
        text: 'Debe seleccionar dos asistentes',
      });
    }
  };

  const buscar = async () => {
    // Validar entrada
    if (!maquina || maquina.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Ingrese un número de máquina',
        text: 'Debe ingresar un número de máquina para buscar',
      });
      return;
    }
    
    // Validar asistentes
    if (extracciones.length < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención!',
        text: 'Debe seleccionar dos asistentes',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Buscando máquina: ${maquina}`);
      const resp = await getInfo(maquina);
      
      if (!resp?.data || resp.data.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Máquina no encontrada',
          text: `No se encontró ninguna máquina con el número ${maquina}`,
        });
        setInfoMaquinas([]);
      } else {
        console.log(`Máquina ${maquina} encontrada, datos recibidos:`, resp.data.length);
        setInfoMaquinas(resp.data);
        setMaquina('');
      }
    } catch (error) {
      console.error('Error al buscar la máquina:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener información de la máquina. Verifique su conexión al servidor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Permitir buscar al presionar Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      buscar();
    }
  };

  const handleChangeSelect = (value) => {
    // Verificar que value es un array y tiene contenido
    if (Array.isArray(value)) {
      // Limitar a máximo 2 asistentes
      const selectedAsistentes = value.slice(0, 2);
      setExtracciones(selectedAsistentes);
      
      // Si solo hay un asistente seleccionado, mostrar aviso
      if (selectedAsistentes.length === 1) {
        console.log('Solo se ha seleccionado un asistente. Se necesitan dos.');
      }
    } else {
      setExtracciones([]);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      
      {/* Pantalla de carga mientras se establece la conexión */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={connectionStatus === 'checking'}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Conectando al servidor...</Typography>
        </Box>
      </Backdrop>
      
      <div className='container'>
        <Card sx={{ mb: 3, width: '100%', maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" component="div" sx={{ mb: 2 }}>
              Extracciones de Casino
              {connectionStatus === 'disconnected' && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  ⚠️ Trabajando con datos locales. Verifique la conexión al servidor.
                </Alert>
              )}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Seleccione Asistentes (2)
                {loadingEmpleados && (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                )}
              </Typography>
              
              <Select
                isMulti
                className='select'
                placeholder='Seleccione Asistentes'
                classNames={'basic-multi-select'}
                classNamePrefix="select"
                options={empleados}
                onChange={handleChangeSelect}
                value={extracciones}
                isLoading={loadingEmpleados}
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                noOptionsMessage={() => "No hay opciones disponibles"}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {empleados.length} asistentes disponibles
                {extracciones.length === 1 && (
                  <Typography variant="caption" color="warning.main" sx={{ ml: 2 }}>
                    ⚠️ Falta seleccionar un asistente más
                  </Typography>
                )}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Máquina
                </Typography>
                <input 
                  type="number" 
                  value={maquina} 
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ingrese número de máquina"
                  style={{ 
                    width: '100%',
                    padding: '8px',
                    fontSize: '16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </Box>
              
              <Button 
                variant="contained" 
                color="success" 
                onClick={buscar}
                disabled={isLoading || extracciones.length < 2}
                sx={{ minWidth: '120px', height: '40px' }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Tabla de máquinas */}
        <div>
          <TablaMaquinas info={infoMaquinas} ext={extracciones} />
        </div>
        
        {/* Snackbar para mensajes de error */}
        <Snackbar 
          open={showError} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="warning" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default Extracciones;