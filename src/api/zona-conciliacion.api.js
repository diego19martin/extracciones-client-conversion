import axios from "axios";

// Función para determinar la URL base de manera dinámica
// Función para determinar la URL base de manera dinámica usando variables de entorno
const determineBaseUrl = () => {
  // Verificar si estamos en entorno de producción
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Usar directamente las variables de entorno
  if (isProduction) {
    // En Vercel usamos la URL de Heroku para el backend
    return process.env.REACT_APP_HOST_HEROKU;
  }
  
  // En desarrollo local
  return process.env.REACT_APP_HOST_LOCAL;
};

// Crear la URL base
const API_URL = determineBaseUrl();

// Agregar interceptor para mostrar más información de debugging
axios.interceptors.request.use(
  (config) => {
    // Si el contenido es FormData, no hacer JSON.stringify para evitar problemas
    if (config.data instanceof FormData) {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log('FormData contiene:', [...config.data.entries()].map(([key, value]) => {
        if (value instanceof File) {
          return `${key}: [File: ${value.name}, tipo: ${value.type}, tamaño: ${value.size}]`;
        }
        return `${key}: ${value.length > 100 ? value.substring(0, 100) + '...' : value}`;
      }));
    } else {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log('Data:', JSON.stringify(config.data || {}, null, 2));
    }
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log(`API Response ${response.status} desde ${response.config.url}`);
    console.log('Response data:', JSON.stringify(response.data || {}, null, 2));
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status} desde ${error.config?.url}`);
      console.error('Error data:', JSON.stringify(error.response.data || {}, null, 2));
    } else if (error.request) {
      console.error(`API Request hecho pero sin respuesta:`, error.request);
    } else {
      console.error(`API Error al configurar request:`, error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Guardar conciliación de zona (versión simplificada sin archivos)
 * @param {Object} conciliacionData - Datos de la conciliación
 * @returns {Promise} Promise con la respuesta
 */
export const guardarConciliacionSoloData = async (conciliacionData) => {
    try {
      console.log('Enviando conciliación (solo datos) a:', `${API_URL}/api/zonas/conciliacion-data`);
      
      // Validación básica
      if (!conciliacionData || typeof conciliacionData !== 'object') {
        throw new Error('Se requieren datos de conciliación válidos');
      }
      
      if (!conciliacionData.zona || !conciliacionData.usuario) {
        throw new Error('Se requiere zona y usuario para la conciliación');
      }
      
      // Enviar directamente como JSON
      return await axios.post(`${API_URL}/api/zonas/conciliacion-data`, conciliacionData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos es suficiente para datos JSON
      });
      
    } catch (error) {
      console.error('Error en guardarConciliacionSoloData:', error);
      throw error;
    }
  };

/**
 * Confirmar una conciliación de zona existente
 * @param {number} id - ID de la conciliación a confirmar
 * @param {string} usuario - Usuario que confirma
 * @returns {Promise} Promise con la respuesta
 */
export const confirmarConciliacionZona = async (id, usuario) => {
  try {
    if (!id || !usuario) {
      throw new Error('Se requiere ID de conciliación y usuario para confirmar');
    }
    
    return await axios.post(`${API_URL}/api/zonas/conciliacion/confirmar`, { 
      id, 
      usuario 
    });
  } catch (error) {
    console.error('Error al confirmar conciliación de zona:', error);
    throw error;
  }
};

/**
 * Obtener todas las conciliaciones de zona con filtros opcionales
 * @param {Object} filtros - Filtros opcionales (zona, fecha, confirmada)
 * @returns {Promise} Promise con la respuesta
 */
export const obtenerConciliaciones = async (filtros = {}) => {
  try {
    // Construir la URL con los parámetros de consulta
    const params = new URLSearchParams();
    
    if (filtros.zona) params.append('zona', filtros.zona);
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.confirmada !== undefined) params.append('confirmada', filtros.confirmada);
    
    const queryString = params.toString();
    const url = `${API_URL}/api/zonas/conciliaciones${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener conciliaciones de zona:', error);
    throw error;
  }
};

/**
 * Obtener una conciliación específica con todos sus detalles
 * @param {number} id - ID de la conciliación
 * @returns {Promise} Promise con la respuesta
 */
export const obtenerConciliacionDetalle = async (id) => {
  try {
    if (!id) {
      throw new Error('Se requiere ID de conciliación para obtener detalles');
    }
    
    const response = await axios.get(`${API_URL}/api/zonas/conciliacion/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle de conciliación:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de conciliaciones
 * @returns {Promise} Promise con las estadísticas
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/zonas/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de conciliaciones:', error);
    throw error;
  }
};

/**
 * Obtener máquinas del tesorero con filtros opcionales
 * @param {Object} filtros - Filtros opcionales 
 * @returns {Promise} Promise con la respuesta
 */
export const obtenerMaquinasTesorero = async (filtros = {}) => {
  try {
    // Construir la URL con los parámetros de consulta
    const params = new URLSearchParams();
    
    // Agregar todos los filtros disponibles
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    const url = `${API_URL}/api/tesorero/maquinas${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener máquinas del tesorero:', error);
    throw error;
  }
};

/**
 * Sincronizar máquinas desde listado/listado_filtrado a maquinas_tesorero
 * @returns {Promise} Promise con la respuesta
 */
export const sincronizarMaquinasTesorero = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/tesorero/sincronizar`);
    return response.data;
  } catch (error) {
    console.error('Error al sincronizar máquinas del tesorero:', error);
    throw error;
  }
};

/**
 * Obtener resumen por zonas para el dashboard del tesorero
 * @returns {Promise} Promise con los datos de resumen por zonas
 */
export const obtenerResumenPorZonas = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tesorero/resumen-zonas`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener resumen por zonas:', error);
      throw error;
    }
  };

  /**
 * Confirmar una zona como tesorero con interfaz mejorada
 * @param {Object} data - Datos para confirmar
 * @param {Number|String} data.id - ID de la conciliación a confirmar
 * @param {String} data.usuario - Usuario que confirma
 * @param {String} data.comentarios - Comentarios adicionales (opcional)
 * @returns {Promise} Promise con la respuesta
 */
export const confirmarZonaComoTesorero = async (data) => {
  try {
    if (!data.id || !data.usuario) {
      throw new Error('Se requiere ID de conciliación y usuario para confirmar');
    }
    
    // Llamar a la función existente con los parámetros correctos
    return await confirmarConciliacionZona(data.id, data.usuario);
  } catch (error) {
    console.error('Error al confirmar zona como tesorero:', error);
    throw error;
  }
};

/**
 * Obtener zonas pendientes de confirmación para el tesorero
 * @param {String} fecha - Fecha en formato YYYY-MM-DD (opcional, por defecto se usa la fecha actual)
 * @returns {Promise} Promise con los datos de zonas pendientes
 */
export const obtenerZonasPendientes = async (fecha) => {
  try {
    // Si no se proporciona fecha, usar la fecha actual
    const fechaParam = fecha || new Date().toISOString().split('T')[0];
    
    // Usar la función existente con filtro confirmada=0
    return await obtenerConciliaciones({
      fecha: fechaParam,
      confirmada: 0
    });
  } catch (error) {
    console.error('Error al obtener zonas pendientes:', error);
    throw error;
  }
};

/**
 * Obtener resumen del tesorero para la fecha actual
 * @returns {Promise} Promise con los datos de resumen
 */
export const obtenerResumenTesoreroDiario = async () => {
  try {
    // Usar la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    
    // Construir la URL con los parámetros de consulta
    const params = new URLSearchParams();
    params.append('fecha', fecha);
    
    const url = `${API_URL}/api/tesorero/resumen?${params.toString()}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen diario del tesorero:', error);
    throw error;
  }
};