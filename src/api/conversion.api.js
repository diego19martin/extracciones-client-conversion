import axios from "axios";
import { API_URL } from './config';

console.log('Inicializando API de conversión con URL:', API_URL);

// Crear una instancia de axios con config común
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 segundos de timeout
});

// Agregar interceptor para manejar tokens
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Conjunto de datos locales para fallback
const empleadosLocales = [
  { empleado_id: 1, nombre: "CRIADO MOLINA GABRIEL DARIO" },
  { empleado_id: 2, nombre: "FARIAS DANIEL" },
  { empleado_id: 5, nombre: "ABASTANTE MIGUEL ALBERTO" },
  { empleado_id: 8, nombre: "FARIAS KEVIN AXEL" },
  { empleado_id: 9, nombre: "CAMINOS GUSTAVO" },
  { empleado_id: 17, nombre: "CAVEZZALI PABLO" }
];

// Funciones exportadas
export const getEmpleados = async () => {
  try {
    const response = await api.get('/api/employees');
    
    // Verificar que la respuesta es válida
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Transformar al formato requerido por el Select component
      return response.data.map(emp => ({
        value: emp.nombre, 
        label: emp.nombre
      }));
    } else {
      console.warn('La respuesta del servidor no contiene datos de empleados válidos');
      
      // Usar datos locales como respaldo
      return empleadosLocales.map(emp => ({
        value: emp.nombre, 
        label: emp.nombre
      }));
    }
  } catch (error) {
    console.error('Error al obtener empleados:', error.message);
    
    // Si falla, devolver datos locales como fallback
    return empleadosLocales.map(emp => ({
      value: emp.nombre, 
      label: emp.nombre
    }));
  }
};

export const postMaquinas = async (listado) => {
  try {
    const response = await api.post('/api/postMaquinas', listado);
    return response;
  } catch (error) {
    console.error('Error al enviar máquinas:', error.message);
    throw error;
  }
};

export const postConfig = async({ valuePesos, valueDolares }) => {
  try {
    const response = await api.post('/api/postConfig', { valuePesos, valueDolares });
    return response;
  } catch (error) {
    console.error('Error al enviar configuración:', error.message);
    throw error;
  }
};

export const getResumen = async () => {
  try {
    const response = await api.get('/api/getResumen');
    return response;
  } catch (error) {
    console.error('Error al obtener resumen:', error.message);
    throw error;
  }
};

export const getInfo = async(maquina) => {
  try {
    const response = await api.get(`/api/getInfo/${maquina}`);
    return response;
  } catch (error) {
    console.error('Error al buscar máquina:', error.message);
    if (error.response && error.response.status === 404) {
      return { data: [] };
    }
    throw error;
  }
};

export const postSelect = async(selectInfo) => {
  try {
    const response = await api.post('/api/postSelect', selectInfo);
    return response;
  } catch (error) {
    console.error('Error al enviar selección:', error.message);
    throw error;
  }
};

export const getTable = async() => {
  try {
    const response = await api.get('/api/getResumen');
    return response;
  } catch (error) {
    console.error('Error al obtener tabla:', error.message);
    throw error;
  }
};

export const postGenerateReport = async () => {
  try {
    return await api.post('/api/generarReporte');
  } catch (error) {
    console.error('Error al generar reporte:', error.message);
    throw error;
  }
};

export const postGenerateDailyReport = async () => {
  try {
    return await api.post('/api/generarReporteDiario');
  } catch (error) {
    console.error('Error al generar reporte diario:', error.message);
    throw error;
  }
};

export const getListadoFiltrado = async () => {
  try {
    const response = await api.get('/api/getListadoFiltrado');
    return response.data;
  } catch (error) {
    console.error('Error al obtener listado filtrado:', error.message);
    return [];
  }
};

export const getConfig = async () => {
  try {
    const response = await api.get('/api/getConfig');
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración:', error.message);
    return { limite: 0, limiteDolar: 1 };  // Valores predeterminados
  }
};

// Función para conciliar conteo de zona (subir y procesar archivos DAT y XLS)
export const conciliarConteoZona = async (datFile, xlsFile) => {
  try {
    // Crear FormData para la subida de archivos
    const formData = new FormData();
    formData.append('datFile', datFile);
    formData.append('xlsFile', xlsFile);
    
    // Primero intentar con fetch para mejor manejo de FormData
    try {
      const response = await fetch(`${API_URL}/api/upload-comparison`, {
        method: 'POST',
        body: formData
      });
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Convertir la respuesta a JSON
      const data = await response.json();
      return data;
    } catch (fetchError) {
      console.warn('Error con fetch, intentando con axios:', fetchError.message);
      
      // Si fetch falla, intentar con axios como respaldo
      const axiosResponse = await axios.post(`${API_URL}/api/upload-comparison`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return axiosResponse.data;
    }
  } catch (error) {
    console.error('Error en conciliación de conteo:', error.message);
    throw error;
  }
};

// Función para obtener datos de máquinas en masa
export const getBulkMachinesExtraction = async (machineIds) => {
  try {
    if (!Array.isArray(machineIds) || machineIds.length === 0) {
      throw new Error('Se requiere un array de IDs de máquinas');
    }
    
    const response = await api.post('/api/getBulkMachinesExtraction', { machines: machineIds });
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de máquinas en bloque:', error.message);
    throw error;
  }
};

// Función para generar reporte de comparación
export const generateComparisonReport = async (resultData) => {
  try {
    const response = await api.post('/api/generate-comparison-report', { data: resultData });
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte de comparación:', error.message);
    throw error;
  }
};

export default api;