import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import Quagga from 'quagga';
import Swal from 'sweetalert2';

// Configuración personalizada para SweetAlert
const swalConfig = {
  customClass: {
    container: 'swal-container-custom', // Clase personalizada para el contenedor
    popup: 'swal-popup-custom' // Clase personalizada para el popup
  },
  buttonsStyling: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  allowOutsideClick: false
};

// Lectores disponibles
const readers = [
  { value: 'code_128_reader', label: 'Code 128' },
  { value: 'ean_reader', label: 'EAN' },
  { value: 'ean_8_reader', label: 'EAN-8' },
  { value: 'code_39_reader', label: 'Code 39' },
  { value: 'code_39_vin_reader', label: 'Code 39 VIN' },
  { value: 'codabar_reader', label: 'Codabar' },
  { value: 'upc_reader', label: 'UPC' },
  { value: 'upc_e_reader', label: 'UPC-E' },
  { value: 'i2of5_reader', label: 'Interleaved 2 of 5 (ITF)' },
  { value: '2of5_reader', label: 'Standard 2 of 5' },
  { value: 'code_93_reader', label: 'Code 93' }
];

// Función para configurar el canvas de forma segura
function configureCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  // Obtener las dimensiones del contenedor
  const container = document.getElementById('scanner-container');
  if (container) {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }
  
  try {
    // Usar willReadFrequently como opción en getContext, no como prop de React
    return canvas.getContext('2d', { willReadFrequently: true });
  } catch (e) {
    console.error("Error al obtener el contexto del canvas:", e);
    return null;
  }
}

// Mapa de formatos a nombres amigables
const formatNames = {
  'code_128': 'Code 128',
  'code_39': 'Code 39',
  'code_39_vin': 'Code 39 VIN',
  'ean_13': 'EAN-13',
  'ean_8': 'EAN-8',
  'upc_a': 'UPC-A',
  'upc_e': 'UPC-E',
  'codabar': 'Codabar',
  'i2of5': 'Interleaved 2 of 5 (ITF)',
  '2of5': 'Standard 2 of 5',
  'code_93': 'Code 93'
};

const SimpleBarcodeScanner = ({ open, onClose, onScan }) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReader, setSelectedReader] = useState('i2of5_reader'); // ITF por defecto
  const scannerRef = useRef(null);
  
  // Referencia a la función de detección para usar en useEffect
  const handleDetectedRef = useRef(null);
  
  // Función para detener el escáner
  const stopScanner = useCallback(() => {
    if (initialized) {
      try {
        if (handleDetectedRef.current) {
          Quagga.offDetected(handleDetectedRef.current);
        }
        Quagga.stop();
        console.log('Escáner detenido');
      } catch (error) {
        console.error('Error al detener Quagga:', error);
      }
      setInitialized(false);
    }
  }, [initialized]);
  
  // Función para manejar códigos detectados
  const handleDetected = useCallback((data) => {
    if (data && data.codeResult && data.codeResult.code) {
      const code = data.codeResult.code;
      console.log('Código detectado:', code);
      
      // Proporcionar feedback visual
      try {
        // Resaltar el área del código detectado
        if (data.box) {
          const ctx = configureCanvas('scanner-canvas');
          if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = '#00FF00'; // Verde
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(data.box[0][0], data.box[0][1]);
            data.box.forEach(point => {
              ctx.lineTo(point[0], point[1]);
            });
            ctx.closePath();
            ctx.stroke();
          }
        }
      } catch (e) {
        console.error("Error al dibujar en el canvas:", e);
      }
      
      // Detener el escáner después de un breve retraso para mostrar el cuadro verde
      setTimeout(() => {
        stopScanner();
        
        // Primero cerrar el diálogo para que el SweetAlert aparezca correctamente
        onClose();
        
        // Luego mostrar SweetAlert con la información del código
        setTimeout(() => {
          // Obtener el nombre amigable del formato
          const formatName = formatNames[data.codeResult.format] || data.codeResult.format;
          const readerName = readers.find(r => r.value === selectedReader)?.label || 'Desconocido';
          
          Swal.fire({
            ...swalConfig,
            icon: 'success',
            title: 'Código detectado',
            html: `
              <div style="text-align: left; margin-bottom: 15px;">
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <h3 style="margin-top: 0; color: #0d6efd;">Información del código</h3>
                  <p style="margin-bottom: 8px;"><strong>Valor:</strong> <span style="font-family: monospace; font-size: 1.1em; background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${code}</span></p>
                  <p style="margin-bottom: 8px;"><strong>Formato:</strong> ${formatName}</p>
                  <p style="margin-bottom: 0;"><strong>Tipo:</strong> ${readerName}</p>
                </div>
                <p style="font-size: 0.9em; color: #6c757d;">El código será enviado al sistema para su procesamiento.</p>
              </div>
            `,
            confirmButtonText: 'Aceptar',
            showCancelButton: false
          }).then((result) => {
            if (result.isConfirmed) {
              // Notificar el código escaneado
              onScan(code);
            }
          });
        }, 100); // Pequeño retraso para asegurar que el diálogo se ha cerrado
      }, 300);
    }
  }, [stopScanner, onScan, onClose, selectedReader]);
  
  // Mantener una referencia actualizada a la función de detección
  useEffect(() => {
    handleDetectedRef.current = handleDetected;
  }, [handleDetected]);

  // Inicializar el escáner
  const initScanner = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Asegurarse de que Quagga esté detenido antes de iniciar
      if (initialized) {
        stopScanner();
      }
      
      // Configuración de Quagga
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: { min: 450 },
            height: { min: 300 },
            facingMode: 'environment',
            aspectRatio: { min: 1, max: 2 }
          },
          target: document.getElementById('scanner-container')
        },
        locator: {
          patchSize: 'medium',
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [selectedReader] // Usar el lector seleccionado
        },
        locate: true
      }, function(err) {
        if (err) {
          console.error('Error iniciando Quagga:', err);
          setError('No se pudo iniciar la cámara. Verifica los permisos de tu navegador.');
          setLoading(false);
          return;
        }
        
        console.log('Quagga inicializado correctamente');
        Quagga.start();
        setInitialized(true);
        setLoading(false);
        
        // Registrar el evento de detección
        Quagga.onDetected(handleDetectedRef.current);
      });
    } catch (initError) {
      console.error('Error al intentar iniciar Quagga:', initError);
      setError('Ocurrió un error inesperado al iniciar el escáner.');
      setLoading(false);
    }
  }, [initialized, selectedReader, stopScanner]);

  // Efecto para iniciar/detener el escáner cuando el diálogo se abre/cierra
  useEffect(() => {
    if (open && !initialized) {
      // Dar tiempo para que el DOM esté listo
      const timer = setTimeout(() => {
        initScanner();
      }, 500);
      return () => clearTimeout(timer);
    }
    
    if (!open && initialized) {
      stopScanner();
    }
    
    // Limpiar al desmontar
    return () => {
      stopScanner();
    };
  }, [open, initialized, initScanner, stopScanner]);

  // Manejar cambio de tipo de lector
  const handleReaderChange = (event) => {
    const newReader = event.target.value;
    setSelectedReader(newReader);
    
    // Reiniciar el escáner con el nuevo lector
    if (initialized) {
      stopScanner();
      setTimeout(() => {
        initScanner();
      }, 300);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {
        stopScanner();
        onClose();
      }} 
      maxWidth="sm" 
      fullWidth
      sx={{ zIndex: 1500 }}
    >
      <DialogTitle>Escáner de Códigos de Barras</DialogTitle>
      
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Código</InputLabel>
          <Select
            value={selectedReader}
            onChange={handleReaderChange}
            label="Tipo de Código"
            disabled={loading || initialized}
          >
            {readers.map(reader => (
              <MenuItem key={reader.value} value={reader.value}>
                {reader.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {error && (
          <Paper 
            elevation={0} 
            sx={{ p: 2, mb: 2, bgcolor: '#ffebee', color: '#c62828' }}
          >
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          Coloca el código de barras dentro del recuadro y mantén el dispositivo estable.
        </Typography>
        
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '300px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}
        >
          {/* Contenedor para el escáner */}
          <div 
            id="scanner-container" 
            ref={scannerRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          />
          
          {/* Canvas para dibujar */}
          <canvas 
            id="scanner-canvas"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
          
          {/* Área de enfoque */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '100px',
              border: '2px dashed #fff',
              pointerEvents: 'none',
              zIndex: 20
            }}
          />
          
          {/* Indicador de carga */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '16px',
                borderRadius: '8px',
                zIndex: 30
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Iniciando cámara...
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Asegúrate de tener buena iluminación y que el código esté enfocado.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={() => {
            stopScanner();
            onClose();
          }} 
          color="secondary"
        >
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            stopScanner();
            setTimeout(() => {
              initScanner();
            }, 300);
          }} 
          color="primary"
          disabled={loading}
        >
          Reiniciar Escáner
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleBarcodeScanner;