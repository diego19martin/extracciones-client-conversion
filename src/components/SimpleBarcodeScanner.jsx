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
  Slider,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import Quagga from 'quagga';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import FlashlightOffIcon from '@mui/icons-material/FlashlightOff';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import AdjustIcon from '@mui/icons-material/Adjust';

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
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [focusAreaSize, setFocusAreaSize] = useState(70); // Porcentaje del área de enfoque (por defecto 70%)
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);
  const [quality, setQuality] = useState("medium"); // quality: low, medium, high
  
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
  
  // Verificar disponibilidad de linterna
  const checkFlashlight = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log('API de mediaDevices no soportada');
        return;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasFlash = devices.some(device => 
        device.kind === 'videoinput' && device.getCapabilities && 
        device.getCapabilities().torch
      );
      
      setHasFlashlight(hasFlash);
      console.log('Linterna disponible:', hasFlash);
    } catch (error) {
      console.error('Error al verificar linterna:', error);
      setHasFlashlight(false);
    }
  }, []);
  
  // Controlar la linterna
  const toggleTorch = useCallback(async () => {
    if (videoTrack && hasFlashlight) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
        console.log('Linterna:', !torchEnabled ? 'ENCENDIDA' : 'APAGADA');
      } catch (error) {
        console.error('Error al controlar la linterna:', error);
        setError('No se pudo controlar la linterna. ' + error.message);
      }
    }
  }, [videoTrack, hasFlashlight, torchEnabled]);
  
  // Ajustar el zoom
  const handleZoomChange = useCallback((newValue) => {
    setZoomLevel(newValue);
    
    if (videoTrack) {
      try {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.zoom) {
          const min = capabilities.zoom.min || 1;
          const max = capabilities.zoom.max || 2;
          const zoomValue = min + (newValue / 100) * (max - min);
          
          videoTrack.applyConstraints({
            advanced: [{ zoom: zoomValue }]
          });
          console.log('Zoom aplicado:', zoomValue);
        }
      } catch (error) {
        console.error('Error al ajustar zoom:', error);
      }
    }
  }, [videoTrack]);
  
  // Ajustar calidad de imagen
  const setImageQuality = useCallback((qualityLevel) => {
    setQuality(qualityLevel);
    if (initialized) {
      // Reiniciar el escáner con la nueva calidad
      stopScanner();
      setTimeout(() => {
        initScanner();
      }, 300);
    }
  }, [initialized]);
  
  // Función para detener el escáner
  const stopScanner = useCallback(() => {
    if (initialized) {
      try {
        if (handleDetectedRef.current) {
          Quagga.offDetected(handleDetectedRef.current);
        }
        Quagga.stop();
        
        // Liberar la linterna si estaba encendida
        if (torchEnabled && videoTrack) {
          videoTrack.applyConstraints({
            advanced: [{ torch: false }]
          }).catch(e => console.error('Error al apagar la linterna:', e));
          setTorchEnabled(false);
        }
        
        setVideoTrack(null);
        console.log('Escáner detenido');
      } catch (error) {
        console.error('Error al detener Quagga:', error);
      }
      setInitialized(false);
    }
  }, [initialized, torchEnabled, videoTrack]);

  // Inicializar el escáner
  const initScanner = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Asegurarse de que Quagga esté detenido antes de iniciar
      if (initialized) {
        stopScanner();
      }
      
      // Determinar configuración de calidad
      let qualityConfig = {};
      switch (quality) {
        case 'low':
          qualityConfig = {
            width: { min: 400 },
            height: { min: 300 },
            aspectRatio: { min: 1, max: 2 }
          };
          break;
        case 'high':
          qualityConfig = {
            width: { min: 1280, ideal: 1920 },
            height: { min: 720, ideal: 1080 },
            aspectRatio: { min: 1, max: 2 }
          };
          break;
        case 'medium':
        default:
          qualityConfig = {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            aspectRatio: { min: 1, max: 2 }
          };
          break;
      }
      
      // Configuración de Quagga
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          constraints: {
            ...qualityConfig,
            facingMode: 'environment',
          },
          target: document.getElementById('scanner-container'),
          area: { // Definir un área de enfoque más específica
            top: "0%",    // Área desde arriba 
            right: "0%",  // Área desde la derecha
            left: "0%",   // Área desde la izquierda
            bottom: "0%"  // Área desde abajo
          }
        },
        locator: {
          patchSize: quality === 'low' ? 'x-small' : quality === 'high' ? 'large' : 'medium',
          halfSample: quality !== 'high' // Deshabilitar halfSample en alta calidad para más precisión
        },
        numOfWorkers: quality === 'high' ? 4 : quality === 'low' ? 1 : 2,
        frequency: quality === 'high' ? 5 : 10, // Menor frecuencia = más precisión pero más CPU
        decoder: {
          readers: ['i2of5_reader', 'code_128_reader', 'ean_reader', 'ean_8_reader'] // Agregar lectores adicionales
        },
        locate: true,
        debug: false
      }, function(err) {
        if (err) {
          console.error('Error iniciando Quagga:', err);
          setError('No se pudo iniciar la cámara. Verifica los permisos de tu navegador.');
          setLoading(false);
          return;
        }
        
        console.log('Quagga inicializado correctamente con calidad:', quality);
        Quagga.start();
        setInitialized(true);
        setLoading(false);
        
        // Registrar el evento de detección
        Quagga.onDetected(handleDetectedRef.current);
        
        // Obtener la pista de video para controlar la linterna y el zoom
        try {
          const videoElement = document.querySelector('#scanner-container video');
          if (videoElement && videoElement.srcObject) {
            const track = videoElement.srcObject.getVideoTracks()[0];
            if (track) {
              setVideoTrack(track);
              
              // Verificar capacidades
              const capabilities = track.getCapabilities ? track.getCapabilities() : {};
              if (capabilities.torch) {
                setHasFlashlight(true);
              }
            }
          }
        } catch (e) {
          console.error('Error al acceder a la pista de video:', e);
        }
        
        // Dibujar la máscara oscura alrededor del área de enfoque
        drawFocusArea();
      });
    } catch (initError) {
      console.error('Error al intentar iniciar Quagga:', initError);
      setError('Ocurrió un error inesperado al iniciar el escáner.');
      setLoading(false);
    }
  }, [initialized, stopScanner, quality, focusAreaSize]);
  
  // Función para dibujar la máscara oscura alrededor del área de enfoque
  const drawFocusArea = () => {
    const ctx = configureCanvas('overlay-canvas');
    if (!ctx) return;
    
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Calcular dimensiones del área de enfoque basado en el porcentaje
    const focusWidthPercent = focusAreaSize;
    const focusHeightPercent = focusAreaSize / 2; // Mantener proporción
    
    const focusWidth = (width * focusWidthPercent) / 100;
    const focusHeight = (height * focusHeightPercent) / 100;
    const focusX = (width - focusWidth) / 2;
    const focusY = (height - focusHeight) / 2;
    
    // Dibujar un rectángulo negro casi opaco sobre toda la pantalla
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Menos opaco para ver mejor el contexto
    ctx.fillRect(0, 0, width, height);
    
    // Crear un "agujero" en el área de enfoque (borrar el área)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(focusX, focusY, focusWidth, focusHeight);
    
    // Restaurar el modo de composición
    ctx.globalCompositeOperation = 'source-over';
    
    // Dibujar el borde punteado alrededor del área de enfoque con más brillo
    ctx.strokeStyle = 'rgba(82, 196, 26, 1)'; // Verde brillante para mejor visibilidad
    ctx.lineWidth = 4; // Más grueso
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(focusX, focusY, focusWidth, focusHeight);
    
    // Dibujar guías de orientación en el centro
    const centerX = focusX + focusWidth / 2;
    const centerY = focusY + focusHeight / 2;
    
    // Cruz central
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Línea horizontal
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY);
    ctx.lineTo(centerX + 15, centerY);
    ctx.stroke();
    
    // Línea vertical
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY + 15);
    ctx.stroke();
  };
  
  // Efecto para redibujar el área de enfoque cuando cambia el tamaño del área o ventana
  useEffect(() => {
    if (initialized) {
      const handleResize = () => {
        drawFocusArea();
      };
      
      window.addEventListener('resize', handleResize);
      drawFocusArea(); // Redibujar cuando cambie el tamaño del área
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [initialized, focusAreaSize]);
  
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
      
      // Vibrar dispositivo si es posible (proporciona feedback táctil)
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
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
        // No mostrar error en cada intento para mejorar UX
        // Solo actualizar el error si es persistente
        return; // Ignorar códigos que no cumplan con el formato requerido
      }
      
      // Proporcionar feedback visual
      try {
        // Resaltar el área del código detectado
        if (data.box) {
          const ctx = configureCanvas('scanner-canvas');
          if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = '#52c41a'; // Verde más brillante
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(data.box[0][0], data.box[0][1]);
            data.box.forEach(point => {
              ctx.lineTo(point[0], point[1]);
            });
            ctx.closePath();
            ctx.stroke();
            
            // Agregar texto con el código
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#52c41a';
            ctx.fillText(code, data.box[0][0], data.box[0][1] - 10);
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
      // Verificar disponibilidad de linterna
      checkFlashlight();
      
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
  }, [open, initialized, initScanner, stopScanner, checkFlashlight]);

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
    
    // Ya no validamos la selección de novedad técnica como obligatoria
    // La máquina puede no tener novedades
    setTechnicalIssueError('');
    
    if (isValid) {
      // Enviar el código y la novedad técnica (puede ser vacía)
      onScan(manualCode, technicalIssue);
      onClose();
    }
  };

  // Verificar si el botón de confirmar debe estar habilitado
  // Ahora solo requiere que el código tenga 10 dígitos, la novedad técnica es opcional
  const isConfirmEnabled = /^\d{10}$/.test(manualCode);

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
            
            {/* Canvas para la máscara oscura */}
            <canvas 
              id="overlay-canvas"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 15
              }}
            />
            
            {/* Controles para la cámara (linterna, zoom, área de enfoque) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 20,
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '8px',
                borderRadius: '12px',
              }}
            >
              {/* Control de la linterna */}
              {hasFlashlight && (
                <Tooltip title={torchEnabled ? "Apagar linterna" : "Encender linterna"}>
                  <IconButton
                    onClick={toggleTorch}
                    sx={{ 
                      color: torchEnabled ? '#ffeb3b' : 'white',
                      backgroundColor: torchEnabled ? 'rgba(0,0,0,0.4)' : 'transparent',
                      mb: 1,
                      '&:hover': {
                        backgroundColor: torchEnabled ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)'
                      }
                    }}
                    size="small"
                  >
                    {torchEnabled ? <FlashlightOnIcon /> : <FlashlightOffIcon />}
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Control para ajustar el área de enfoque */}
              <Tooltip title="Ajustar área de enfoque">
                <IconButton
                  onClick={() => {
                    // Alternar entre tres tamaños: pequeño, mediano, grande
                    const newSize = focusAreaSize === 50 ? 70 : 
                                   focusAreaSize === 70 ? 90 : 50;
                    setFocusAreaSize(newSize);
                  }}
                  sx={{ 
                    color: 'white',
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                  size="small"
                >
                  <AdjustIcon fontSize={focusAreaSize === 50 ? 'small' : 
                                        focusAreaSize === 70 ? 'medium' : 'large'} />
                </IconButton>
              </Tooltip>
            </Box>
            
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
          
          {/* Controles de cámara (calidad y reinicio) */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Selector de calidad */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                Calidad:
              </Typography>
              <Select
                value={quality}
                onChange={(e) => setImageQuality(e.target.value)}
                size="small"
                variant="outlined"
                sx={{ 
                  minWidth: 100, 
                  height: 32,
                  fontSize: '0.75rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '16px'
                  }
                }}
              >
                <MenuItem value="low">Baja</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </Box>
            
            {/* Botón para reiniciar la cámara */}
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
                Novedad Técnica (Opcional)
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
          disabled={!isConfirmEnabled}
        >
          CONFIRMAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleBarcodeScanner;