import { useState, useEffect } from 'react';
import axios from 'axios';

// Función para determinar la URL de la API
const determineBaseUrl = () => {
  const API_URL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_HOST_HEROKU
    : process.env.NODE_ENV === 'vercel'
    ? process.env.REACT_APP_HOST_VERCEL
    : process.env.REACT_APP_HOST_LOCAL || 'http://localhost:3001';
  
  return API_URL;
};

const API_URL = determineBaseUrl();

export const useFetchSummaryData = (dateString) => {
  const [data, setData] = useState({
    totalMachines: 0,
    totalExpected: 0,
    totalCounted: 0,
    difference: 0,
    percentageDifference: 0,
    confirmedZones: 0,
    matchingMachines: 0,
    nonMatchingMachines: 0,
    missingMachines: 0,
    extraMachines: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!dateString) {
      console.warn("No hay fecha seleccionada para filtrar");
      setData({
        totalMachines: 0,
        totalExpected: 0,
        totalCounted: 0,
        difference: 0,
        percentageDifference: 0,
        confirmedZones: 0,
        matchingMachines: 0,
        nonMatchingMachines: 0,
        missingMachines: 0,
        extraMachines: 0
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Buscando datos para la fecha:", dateString);
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      // CORRECCIÓN: Usar la fecha exacta para filtrar por fecha_confirmacion
      params.append('fecha_confirmacion', dateString);
      
      // Obtener token del localStorage para autorización si existe
      const token = localStorage.getItem('token');
      
      // Usar el endpoint correcto que ya existe, modificado para usar fecha_confirmacion
      let response;
      
      try {
        // Intentar con headers de autorización si hay token
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        response = await axios.get(`${API_URL}/api/zonas-tesorero?${params.toString()}`, { headers });
      } catch (apiError) {
        console.warn("Error al obtener datos de API:", apiError);
        
        // Intentar consultar directamente en la tabla zona_conciliacion
        response = await axios.get(`${API_URL}/api/zona-conciliacion?${params.toString()}`);
      }
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Datos de zonas recibidos:", response.data);
        
        // CORRECCIÓN: Filtrar zonas confirmadas y por fecha_confirmacion exacta
        const confirmedZones = response.data.filter(zone => {
          // Asegurarse de que la zona esté confirmada
          if (zone.confirmada !== 1) {
            return false;
          }
          
          // CORRECCIÓN: Verificar que la fecha_confirmacion coincida exactamente con dateString
          if (zone.fecha_confirmacion) {
            // Extraer la parte de la fecha (yyyy-MM-dd) de fecha_confirmacion
            const confirmationDate = zone.fecha_confirmacion.split(' ')[0];
            console.log(`Comparando fecha_confirmacion: ${confirmationDate} con fecha seleccionada: ${dateString}`);
            return confirmationDate === dateString;
          }
          
          return false; // CORRECCIÓN: Si no tiene fecha_confirmacion, no la incluimos
        });
        
        console.log("Zonas confirmadas para la fecha seleccionada:", confirmedZones);
        
        if (confirmedZones.length > 0) {
          // Calcular totales con verificación de números
          const totalExpected = confirmedZones.reduce((sum, zone) => {
            const value = parseFloat(zone.total_esperado || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const totalCounted = confirmedZones.reduce((sum, zone) => {
            const value = parseFloat(zone.total_contado || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const difference = totalCounted - totalExpected;
          const percentageDifference = totalExpected > 0 
            ? ((totalCounted / totalExpected) * 100) - 100 
            : 0;
          
          // Calcular total de máquinas con verificación de números
          const totalMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_totales || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const matchingMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_coincidentes || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const nonMatchingMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_discrepancia || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const missingMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_faltantes || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          const extraMachines = confirmedZones.reduce((sum, zone) => {
            const value = parseInt(zone.maquinas_extra || 0);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          
          // Actualizar el estado con los valores calculados
          setData({
            totalMachines,
            totalExpected,
            totalCounted,
            difference,
            percentageDifference,
            confirmedZones: confirmedZones.length,
            matchingMachines,
            nonMatchingMachines,
            missingMachines,
            extraMachines
          });
        } else {
          console.log("No hay zonas confirmadas para la fecha seleccionada");
          // Mantener los valores en cero cuando no hay zonas confirmadas
          setData({
            totalMachines: 0,
            totalExpected: 0,
            totalCounted: 0,
            difference: 0,
            percentageDifference: 0,
            confirmedZones: 0,
            matchingMachines: 0,
            nonMatchingMachines: 0,
            missingMachines: 0,
            extraMachines: 0
          });
        }
      } else {
        console.warn("La respuesta no contiene un array de zonas");
        setError("No se pudieron cargar datos. La respuesta del servidor no tiene el formato esperado.");
      }
    } catch (error) {
      console.error('Error al obtener resumen del tesorero:', error);
      setError("Error al conectar con el servidor. Intente nuevamente más tarde.");
      
      // Mantener los valores en cero en caso de error
      setData({
        totalMachines: 0,
        totalExpected: 0,
        totalCounted: 0,
        difference: 0,
        percentageDifference: 0,
        confirmedZones: 0,
        matchingMachines: 0,
        nonMatchingMachines: 0,
        missingMachines: 0,
        extraMachines: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Establecer un intervalo para actualizar los datos automáticamente cada 30 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [dateString]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};