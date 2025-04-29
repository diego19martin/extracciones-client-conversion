import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { guardarConciliacionSoloData } from '../../api/zona-conciliacion.api';
import Swal from 'sweetalert2';

/**
 * Botón para confirmar la conciliación de una zona mediante SweetAlert
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.summary - Resumen de la conciliación
 * @param {Array} props.results - Resultados detallados de la conciliación
 * @param {File} props.datFile - Archivo DAT original
 * @param {File} props.xlsFile - Archivo XLS original
 * @param {Function} props.onSuccess - Callback ejecutado después de confirmar con éxito
 */
const ConfirmZoneButton = ({ summary, results, datFile, xlsFile, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  // Verificar si hay datos suficientes para confirmar
  const canConfirm = summary && results && results.length > 0;
  
  // Función para normalizar y validar un resultado de máquina
  const normalizeResult = (result) => {
    // Asegurarse de que todos los campos numéricos sean números válidos
    const normalizedResult = {
      ...result,
      machineId: result.machineId || result.maquina || '',
      expectedAmount: parseFloat(result.expectedAmount || 0) || 0,
      countedAmount: parseFloat(result.countedAmount || 0) || 0,
      countedPhysical: parseFloat(result.countedPhysical || 0) || 0,
      countedVirtual: parseFloat(result.countedVirtual || 0) || 0,
      status: result.status || 'UNKNOWN',
      // Conservar los objetos completos de billetes
      billetesFisicos: result.billetesFisicos || {},
      billetesVirtuales: result.billetesVirtuales || {}
    };

    return normalizedResult;
  };
  
  // Función para manejar el guardado y los errores
  const guardarConciliacion = async (conciliacionData, forceUpdate = false) => {
    try {
      // Si se pide forzar la actualización, añadir el flag
      if (forceUpdate) {
        conciliacionData.forceUpdate = true;
      }
      
      console.log('Enviando datos al servidor (solo datos, sin archivos)...');
      console.log('Datos a enviar:', JSON.stringify(conciliacionData, null, 2));
      
      // Usar el método que solo envía datos (sin archivos)
      const response = await guardarConciliacionSoloData(conciliacionData);
      
      console.log('Respuesta del servidor:', response);
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Conciliación guardada',
        html: `
          <p>La conciliación de la zona <strong>${conciliacionData.zona}</strong> ha sido confirmada correctamente.</p>
          <p style="margin-top: 10px; color: #4caf50; font-size: 0.9em;">ID de conciliación: ${response.data.id}</p>
        `,
        timer: 5000,
        timerProgressBar: true
      });
      
      // Llamar callback de éxito si existe
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
      
    } catch (error) {
      console.error('Error al guardar conciliación:', error);
      
      // Verificar si el error es porque ya hay máquinas conciliadas hoy
      if (error.response && error.response.status === 409 && error.response.data.needsConfirmation) {
        // Obtener las máquinas ya conciliadas
        const existingMachines = error.response.data.existingMachines || [];
        const totalExisting = error.response.data.totalExisting || 0;
        
        // Crear HTML para mostrar las máquinas en SweetAlert2
        let machinesHtml = '';
        
        // Mostrar hasta 10 máquinas máximo para no sobrecargar la alerta
        const maxToShow = Math.min(existingMachines.length, 10);
        
        for (let i = 0; i < maxToShow; i++) {
          machinesHtml += `<div style="margin: 5px 0; padding: 5px; background-color: #f5f5f5; border-radius: 4px;">Máquina #${existingMachines[i]}</div>`;
        }
        
        if (existingMachines.length > maxToShow) {
          machinesHtml += `<div style="text-align: center; margin-top: 10px; color: #666;">... y ${existingMachines.length - maxToShow} máquinas más</div>`;
        }
        
        // Mostrar alerta con SweetAlert2
        Swal.fire({
          title: 'Máquinas ya conciliadas hoy',
          icon: 'warning',
          html: `
            <div style="text-align: left;">
              <div style="margin-bottom: 15px;">
                <p>Se detectaron <strong>${totalExisting}</strong> máquinas que ya han sido conciliadas hoy.</p>
                <p>Si continúa, se sobreescribirán los datos de conciliación anteriores.</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <p style="font-weight: 500;">Máquinas afectadas:</p>
                <div style="max-height: 200px; overflow-y: auto; margin-top: 10px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                  ${machinesHtml}
                </div>
              </div>
              
              <div style="margin-top: 15px; padding: 10px; background-color: #e3f2fd; border-radius: 4px;">
                <p style="margin: 0; color: #0d47a1; font-size: 14px;">
                  <i class="fa fa-info-circle"></i> Las conciliaciones anteriores quedarán registradas en el historial, pero los valores actuales serán reemplazados.
                </p>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#ff9800',
          cancelButtonColor: '#ccc',
          confirmButtonText: 'Continuar y sobreescribir',
          cancelButtonText: 'Cancelar',
          width: '600px'
        }).then((result) => {
          if (result.isConfirmed) {
            // Si el usuario confirma, intentar guardar nuevamente con forceUpdate
            guardarConciliacion(conciliacionData, true);
          }
        });
        
        return;
      }
      
      // Otro tipo de error - mostrar mensaje general
      let errorMessage = 'Ocurrió un error al confirmar la conciliación.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      // Si hay un error específico de un campo, mostrarlo
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage += ` (${error.response.data.error})`;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    }
  };
  
  // Manejar la confirmación mediante SweetAlert2
  const handleConfirmClick = async () => {
    if (!canConfirm) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay datos suficientes',
        text: 'No hay resultados de conciliación para confirmar.'
      });
      return;
    }
    
    // Mostrar el primer modal para ingresar la zona
    const { value: zona } = await Swal.fire({
      title: 'Confirmar Conciliación',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p>Ingrese el número de zona para guardar los resultados de la conciliación:</p>
          <input 
            id="swal-input-zona" 
            class="swal2-input" 
            placeholder="Ej: ZONA1, ZONA2..." 
            style="width: 100%;"
          >
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      preConfirm: () => {
        const inputZona = document.getElementById('swal-input-zona').value;
        if (!inputZona || inputZona.trim() === '') {
          Swal.showValidationMessage('Debe ingresar un número de zona');
          return false;
        }
        return inputZona.trim().toUpperCase();
      }
    });
    
    // Si el usuario cancela, no continuamos
    if (!zona) return;
    
    // Mostrar el segundo modal para confirmar y agregar información adicional
    const { value: formValues } = await Swal.fire({
      title: `Confirmar Zona ${zona}`,
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; font-size: 16px;">Resumen de la conciliación:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div>
                <p style="margin: 5px 0; font-size: 14px;">Total esperado: <strong>$${summary?.totalExpected?.toLocaleString('es-AR') || 0}</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">Máquinas coincidentes: <strong>${summary?.matchingMachines || 0}</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">Máquinas faltantes: <strong>${summary?.missingMachines || 0}</strong></p>
              </div>
              <div>
                <p style="margin: 5px 0; font-size: 14px;">Total contado: <strong>$${summary?.totalCounted?.toLocaleString('es-AR') || 0}</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">Máquinas con discrepancia: <strong>${summary?.nonMatchingMachines || 0}</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">Máquinas extra: <strong>${summary?.extraMachines || 0}</strong></p>
              </div>
            </div>
          </div>
          <p>Usuario que confirma:<p>
          <input 
            id="swal-input-usuario" 
            class="swal2-input" 
            placeholder="Ingrese su nombre de usuario" 
            style="width: 100%;"
          >
          <p>Comentarios (opcional):<p>
          <textarea 
            id="swal-input-comentarios" 
            class="swal2-textarea" 
            placeholder="Comentarios adicionales sobre esta conciliación..." 
            style="width: 100%; min-height: 100px;"
          ></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar Conciliación',
      preConfirm: () => {
        const usuario = document.getElementById('swal-input-usuario').value;
        const comentarios = document.getElementById('swal-input-comentarios').value;
        
        if (!usuario || usuario.trim() === '') {
          Swal.showValidationMessage('Debe ingresar su nombre de usuario');
          return false;
        }
        
        return {
          usuario: usuario.trim(),
          comentarios: comentarios.trim()
        };
      }
    });
    
    // Si el usuario cancela, no continuamos
    if (!formValues) return;
    
    // Ahora procesamos la confirmación con los datos proporcionados
    setLoading(true);
    
    try {
      // Normalizar y validar cada resultado para asegurar que tiene la estructura correcta
      const normalizedResults = results.map(normalizeResult);
      
      console.log('Resultados normalizados:', normalizedResults.length);
      
      // Calcular diferencia entre total esperado y contado
      const diferencia = (summary.totalCounted || 0) - (summary.totalExpected || 0);
      
      // Preparar datos para guardar - asegurando que todos los campos estén presentes
      const conciliacionData = {
        zona,
        usuario: formValues.usuario,
        comentarios: formValues.comentarios || '',
        totalEsperado: summary.totalExpected || 0,
        totalContado: summary.totalCounted || 0,
        diferencia: diferencia,
        maquinasTotales: normalizedResults.length,
        maquinasCoincidentes: summary.matchingMachines || 0,
        maquinasDiscrepancia: summary.nonMatchingMachines || 0,
        maquinasFaltantes: summary.missingMachines || 0, 
        maquinasExtra: summary.extraMachines || 0,
        resultados: normalizedResults,
        confirmada: false 
      };
      
      // Iniciar el proceso de guardado
      await guardarConciliacion(conciliacionData, false);
      
    } catch (error) {
      console.error('Error al confirmar conciliación:', error);
      // El error ya se maneja en guardarConciliacion
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant="contained"
      color="success"
      size="large"
      startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DoneAllIcon />}
      onClick={handleConfirmClick}
      disabled={loading || !canConfirm}
      fullWidth
      sx={{
        py: 1.5,
        fontWeight: 'bold',
        fontSize: '1.1rem',
        boxShadow: theme => `0 4px 20px 0 rgba(76, 175, 80, 0.2)`,
        '&:hover': {
          bgcolor: 'success.dark',
          boxShadow: theme => `0 6px 25px 0 rgba(76, 175, 80, 0.3)`
        }
      }}
    >
      {loading ? "PROCESANDO..." : "CONFIRMAR CONCILIACIÓN DE ZONA"}
    </Button>
  );
};

export default ConfirmZoneButton;