/**
 * API para el Dashboard del Tesorero
 * Funciones especializadas para la gestión de zonas pendientes
 */

import axios from 'axios';
import Swal from 'sweetalert2';
import { determineBaseUrl } from '../../utils/apiUtils';

// Obtener URL base
const API_URL = determineBaseUrl();

/**
 * Confirmar una zona como tesorero (usa la API existente pero adaptada para el flujo del tesorero)
 * @param {Object} data - Datos para confirmar
 * @param {Number|String} data.id - ID de la conciliación a confirmar
 * @param {String} data.usuario - Usuario que confirma
 * @param {String} data.comentarios - Comentarios adicionales (opcional)
 * @returns {Promise} Promise con la respuesta
 */
export const confirmarZonaTesorero = async (data) => {
  try {
    if (!data.id || !data.usuario) {
      throw new Error('Se requiere ID de conciliación y usuario para confirmar');
    }
    
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Confirmando zona...',
      text: 'Procesando su solicitud',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Usar la API existente con los parámetros correctos
    const response = await axios.post(`${API_URL}/api/zonas/conciliacion/confirmar`, { 
      id: data.id, 
      usuario: data.usuario,
      comentarios: data.comentarios || '' // Incluir comentarios si existen
    });
    
    // Cerrar indicador de carga
    Swal.close();
    
    // Mostrar mensaje de éxito
    if (response.data && response.data.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Zona confirmada!',
        text: 'La zona ha sido confirmada exitosamente',
        timer: 3000,
        timerProgressBar: true
      });
    }
    
    return response.data;
  } catch (error) {
    // Cerrar el indicador de carga
    Swal.close();
    
    // Mostrar error
    console.error('Error al confirmar zona:', error);
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message || 'Error al confirmar la zona',
      confirmButtonText: 'Aceptar'
    });
    
    throw error;
  }
};

/**
 * Obtener zonas pendientes de confirmación para el tesorero
 * @param {String} fecha - Fecha en formato YYYY-MM-DD (opcional, por defecto se usa la fecha actual)
 * @returns {Promise} Promise con los datos de zonas pendientes
 */
export const getZonasPendientes = async (fecha) => {
  try {
    // Si no se proporciona fecha, usar la fecha actual
    const fechaParam = fecha || new Date().toISOString().split('T')[0];
    
    // Construir los parámetros de consulta
    const params = new URLSearchParams();
    params.append('fecha', fechaParam);
    params.append('confirmada', '0'); // Solo zonas no confirmadas
    
    // Usar la API existente para obtener conciliaciones
    const response = await axios.get(`${API_URL}/api/zonas/conciliaciones?${params.toString()}`);
    
    // Devolver los datos
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener zonas pendientes:', error);
    throw error;
  }
};

/**
 * Obtener resumen de zonas para el dashboard del tesorero
 * @param {String} fecha - Fecha en formato YYYY-MM-DD (opcional)
 * @returns {Promise} Promise con los datos de resumen
 */
export const getResumenZonasTesorero = async (fecha) => {
  try {
    // Si se proporciona fecha, añadirla como parámetro
    let url = `${API_URL}/api/tesorero/resumen`;
    
    if (fecha) {
      const params = new URLSearchParams();
      params.append('fecha', fecha);
      url = `${url}?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen del tesorero:', error);
    throw error;
  }
};

/**
 * Mostrar modal de confirmación para una zona
 * @param {Object} zona - Datos de la zona a confirmar
 * @param {Function} onSuccess - Callback a ejecutar después de confirmar con éxito
 */
export const mostrarModalConfirmacion = async (zona, onSuccess) => {
  // Validar que tengamos datos de zona
  if (!zona || !zona.id) {
    console.error('Datos de zona inválidos');
    return;
  }
  
  // Mostrar modal de confirmación con SweetAlert2
  const { value: formValues } = await Swal.fire({
    title: `Confirmar Zona ${zona.zona}`,
    html: `
      <div style="text-align: left">
        <p>¿Confirma que ha recibido el dinero correspondiente a esta zona?</p>
        <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px;"><strong>Total esperado:</strong> ${zona.total_esperado?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Total contado:</strong> ${zona.total_contado?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Diferencia:</strong> <span style="color: ${zona.diferencia >= 0 ? 'green' : 'red'}">
            ${zona.diferencia?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}
          </span></p>
        </div>
        <p>Usuario que confirma:</p>
        <input 
          id="swal-input-usuario" 
          class="swal2-input" 
          placeholder="Ingrese su nombre de usuario" 
          style="width: 100%"
        >
        <p>Comentarios (opcional):</p>
        <textarea 
          id="swal-input-comentarios" 
          class="swal2-textarea" 
          placeholder="Comentarios adicionales..." 
          style="width: 100%; min-height: 100px"
        ></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4caf50',
    preConfirm: () => {
      const usuario = document.getElementById('swal-input-usuario').value;
      const comentarios = document.getElementById('swal-input-comentarios').value;
      
      if (!usuario) {
        Swal.showValidationMessage('Debe ingresar su nombre de usuario');
        return false;
      }
      
      return {
        usuario,
        comentarios
      };
    }
  });
  
  // Si el usuario cancela, no continuamos
  if (!formValues) return;
  
  try {
    // Confirmar la zona
    await confirmarZonaTesorero({
      id: zona.id,
      usuario: formValues.usuario,
      comentarios: formValues.comentarios
    });
    
    // Ejecutar callback de éxito si está definido
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess();
    }
  } catch (error) {
    // El error ya se maneja en confirmarZonaTesorero
    console.error('Error al procesar confirmación:', error);
  }
};

// Exportamos todas las funciones como un objeto
export default {
  confirmarZonaTesorero,
  getZonasPendientes,
  getResumenZonasTesorero,
  mostrarModalConfirmacion
};