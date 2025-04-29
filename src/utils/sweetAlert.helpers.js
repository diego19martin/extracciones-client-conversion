import Swal from 'sweetalert2';
import { confirmarZonaComoTesorero } from '../api/zona-conciliacion.api';
import { formatCurrency } from './formatUtils';

/**
 * Muestra un modal de confirmación para una zona del tesorero
 * @param {Object} zona - Datos de la zona a confirmar
 * @param {Function} onSuccess - Callback que se ejecuta cuando la confirmación es exitosa
 */
export const mostrarConfirmacionZona = async (zona, onSuccess) => {
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
          <p style="margin: 0; font-size: 14px;"><strong>Total esperado:</strong> ${formatCurrency(zona.total_esperado) || '$0'}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Total contado:</strong> ${formatCurrency(zona.total_contado) || '$0'}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Diferencia:</strong> <span style="color: ${zona.diferencia >= 0 ? 'green' : 'red'}">
            ${formatCurrency(zona.diferencia) || '$0'}
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
  
  // Mostrar indicador de carga
  Swal.fire({
    title: 'Confirmando zona...',
    text: 'Procesando su solicitud',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
  try {
    // Confirmar la zona con la API existente
    await confirmarZonaComoTesorero({
      id: zona.id,
      usuario: formValues.usuario,
      comentarios: formValues.comentarios
    });
    
    // Cerrar indicador de carga
    Swal.close();
    
    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Zona confirmada!',
      text: 'La zona ha sido confirmada exitosamente',
      timer: 3000,
      timerProgressBar: true
    });
    
    // Ejecutar callback de éxito
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess();
    }
  } catch (error) {
    // Cerrar indicador de carga
    Swal.close();
    
    // Mostrar mensaje de error
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Ocurrió un error al confirmar la zona',
      confirmButtonText: 'Aceptar'
    });
  }
};

/**
 * Muestra un modal con los detalles de una zona
 * @param {Object} zona - Datos de la zona a mostrar
 */
export const mostrarDetallesZona = (zona) => {
  // Formatear fechas y horas para mostrar
  const formattedDate = zona.fecha ? 
    new Date(zona.fecha).toLocaleDateString('es-AR') : 'N/A';
  const formattedTime = zona.hora || 'N/A';
  
  // Mostrar modal con detalles usando SweetAlert2
  Swal.fire({
    title: `Zona ${zona.zona}`,
    html: `
      <div style="text-align: left">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; width: 40%;"><strong>ID:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${zona.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Hora:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Usuario:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${zona.usuario || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Esperado:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatCurrency(zona.total_esperado)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Contado:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatCurrency(zona.total_contado)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Diferencia:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${zona.diferencia >= 0 ? 'green' : 'red'}">
              ${formatCurrency(zona.diferencia)}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Máquinas Totales:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${zona.maquinas_totales || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Máquinas Coincidentes:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${zona.maquinas_coincidentes || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Máquinas con Discrepancia:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${zona.maquinas_discrepancia || 0}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Comentarios:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${zona.comentarios || 'N/A'}</td>
          </tr>
        </table>
      </div>
    `,
    width: 600,
    confirmButtonText: 'Cerrar'
  });
};