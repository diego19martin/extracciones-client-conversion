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
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Backdrop
} from '@mui/material';
import Quagga from 'quagga';

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
    return canvas.getContext('2d', { willReadFrequently: true });
  } catch (e) {
    console.error("Error al obtener el contexto del canvas:", e);
    return null;
  }
}

const SimpleBarcodeScanner = ({ 
  open, 
  onClose, 
  onScan, 
  isSubmitting = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [manualCodeError, setManualCodeError] = useState('');
  const [lastDetectedCode, setLastDetectedCode] = useState('');
  const [technicalIssue, setTechnicalIssue] = useState('');
  const [technicalIssueError, setTechnicalIssueError] = useState('');
  const scannerRef = useRef(null);
  
  // Lista predefinida de novedades técnicas
  const predefinedIssues = [
    'Cerradura 3070',
    'Cerradura 020',
    'Cerradura 091',
    'Cerradura Venia',
    'Puerta Principal',
    'Puerta belly',
    'Pestillo',
    'Puerta de stacker'
  ];
  
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
          readers: ['i2of5_reader'] // Usar ITF por defecto
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
  }, [initialized, stopScanner]);
  
  // Procesar el código detectado o ingresado manualmente
  const processCode = useCallback((code, isManual = false) => {
    console.log('Código ' + (isManual ? 'ingresado:' : 'detectado:'), code);
    
    // Detener el escáner temporalmente
    if (!isManual) {
      stopScanner();
    }
    
    // Actualizar el último código detectado y también precompletar el campo manual
    setLastDetectedCode(code);
    setManualCode(code);
    setError(null); // Limpiar cualquier error previo
    
    // Reproducir un sonido de éxito
    try {
      const successSound = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vm//Lnlz//m+//z//o8//3//+///vvvvz//+//cpdAkmDAJChQoSGi4MIlYkAAQkUAT0OdDSUFAGkdXBwICYDNQYEYgtQYHYhWwq6CnQUCJAABHAMXCAAIgDlQIQQMQIEkFswMCggMDGrGyQRQRLwkRAOQUFEmgAAAVYXCi0AAAAAElFTkSuQmCC");
      successSound.play();
    } catch (e) {
      console.error("Error reproduciendo sonido:", e);
    }
  }, [stopScanner]);
  
  // Función para manejar códigos detectados
  const handleDetected = useCallback((data) => {
    if (data && data.codeResult && data.codeResult.code) {
      const code = data.codeResult.code;
      
      // Validar que el código tenga 10 dígitos
      if (!/^\d{10}$/.test(code)) {
        console.log('Código detectado no tiene 10 dígitos:', code);
        setError('El código escaneado debe tener 10 dígitos. Intente de nuevo o ingrese manualmente.');
        return; // Ignorar códigos que no cumplan con el formato requerido
      }
      
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
      
      // Procesar el código tras un pequeño retraso para permitir el feedback visual
      setTimeout(() => {
        processCode(code, false);
      }, 500);
    }
  }, [processCode]);
  
  // Mantener una referencia actualizada a la función de detección
  useEffect(() => {
    handleDetectedRef.current = handleDetected;
  }, [handleDetected]);

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

  // Validar y enviar el formulario
  const handleSubmit = () => {
    let isValid = true;
    
    // Validar que el código tenga exactamente 10 dígitos
    if (!/^\d{10}$/.test(manualCode)) {
      setManualCodeError('El código debe contener exactamente 10 dígitos numéricos');
      isValid = false;
    } else {
      setManualCodeError('');
    }
    
    // Validar que se haya seleccionado una novedad técnica
    if (!technicalIssue) {
      setTechnicalIssueError('Debe seleccionar una novedad técnica');
      isValid = false;
    } else {
      setTechnicalIssueError('');
    }
    
    if (isValid) {
      // Enviar el código y la novedad técnica
      onScan(manualCode, technicalIssue);
      onClose();
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
      sx={{ 
        zIndex: 1500,
        '& .MuiDialog-paper': {
          zIndex: 1500
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Escáner de Código Headercard
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Escanee el código de 10 dígitos y seleccione la novedad técnica
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Paper 
            elevation={0} 
            sx={{ p: 2, mb: 2, bgcolor: '#ffebee', color: '#c62828' }}
          >
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
        
        {/* Sección de Escáner */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '260px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#000',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
                border: '2px dashed rgba(255,255,255,0.8)',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 20,
                boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.3)'
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
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '16px',
                  borderRadius: '12px',
                  zIndex: 30,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                <CircularProgress size={40} color="primary" />
                <Typography variant="body2" sx={{ mt: 1, color: '#333' }}>
                  Iniciando cámara...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            <Button 
              onClick={() => {
                stopScanner();
                setTimeout(() => {
                  initScanner();
                }, 300);
              }} 
              color="primary"
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{ borderRadius: '20px', fontSize: '0.75rem' }}
            >
              Reiniciar Cámara
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" sx={{ color: '#777', px: 1 }}>
            INFORMACIÓN REQUERIDA
          </Typography>
        </Divider>
        
        {/* Sección de Ingreso Manual */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ 
              fontWeight: 'bold',
              color: manualCodeError ? '#d32f2f' : 'inherit'
            }}>
              Código de Headercard (10 dígitos):
            </Typography>
            
            <input
              type="text"
              value={manualCode}
              onChange={(e) => {
                // Solo permitir dígitos
                const value = e.target.value.replace(/[^\d]/g, '');
                setManualCode(value);
                // Limpiar el error si se empieza a escribir de nuevo
                if (manualCodeError) setManualCodeError('');
              }}
              placeholder="Ingrese los 10 dígitos"
              inputMode="numeric"
              maxLength={10}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: manualCodeError ? '2px solid #d32f2f' : '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
            
            {manualCodeError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {manualCodeError}
              </Typography>
            )}
          </Box>
          
          {/* Selección de novedad técnica */}
          <FormControl 
            fullWidth 
            error={!!technicalIssueError} 
            sx={{ 
              mb: 2, 
              '& .MuiSelect-select': {
                zIndex: 2000 // Increase z-index
              }
            }}
          >
            <InputLabel 
              id="technical-issue-label"
              sx={{ 
                zIndex: 2000 // Increase z-index for label
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#d32f2f', marginRight: '4px' }}>⚠️</span>
                Novedad Técnica
              </Box>
            </InputLabel>
            <Select
              labelId="technical-issue-label"
              value={technicalIssue}
              onChange={(e) => {
                setTechnicalIssue(e.target.value);
                if (technicalIssueError) setTechnicalIssueError('');
              }}
              label="🔧 Novedad Técnica"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    zIndex: 2100 // Ensure dropdown is above other elements
                  }
                },
                sx: {
                  zIndex: 2100 // Additional z-index for the menu
                }
              }}
              sx={{
                zIndex: 2000 // Increase z-index for the select component
              }}
            >
              {predefinedIssues.map((issue) => (
                <MenuItem key={issue} value={issue}>
                  {issue}
                </MenuItem>
              ))}
            </Select>
            {technicalIssueError && <FormHelperText>{technicalIssueError}</FormHelperText>}
          </FormControl>
          
          {lastDetectedCode && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'rgba(232, 245, 233, 0.6)', 
              borderRadius: '8px',
              border: '1px solid rgba(46, 125, 50, 0.2)'
            }}>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>✓</span>
                Último código detectado: <strong style={{ marginLeft: '4px' }}>{lastDetectedCode}</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          onClick={() => {
            stopScanner();
            onClose();
          }} 
          color="secondary"
          variant="outlined"
          sx={{ 
            borderRadius: '10px', 
            width: '45%',
            fontSize: '1rem',
            padding: '10px 0'
          }}
        >
          CANCELAR
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          variant="contained"
          sx={{ 
            borderRadius: '10px',
            width: '45%',
            fontSize: '1rem',
            padding: '10px 0'
          }}
          disabled={!manualCode || !technicalIssue}
        >
          CONFIRMAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleBarcodeScanner;