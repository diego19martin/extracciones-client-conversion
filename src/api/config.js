// src/api/config.js
// Archivo centralizado para la configuración de la API

// Función para determinar la URL base de manera dinámica
const determineBaseUrl = () => {
    // Verificar si estamos en entorno de producción
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Usar directamente las variables de entorno
    if (isProduction) {
      return process.env.REACT_APP_HOST_HEROKU || 'https://extraccione-server.herokuapp.com';
    }
    
    // En desarrollo local
    return process.env.REACT_APP_HOST_LOCAL || 'http://localhost:4000';
  };
  
  // Determinar la URL base al cargar el archivo (una sola vez)
  export const API_URL = determineBaseUrl();
  
  console.log('Inicializando configuración con URL:', API_URL);
  
  // Otras constantes de configuración
  export const DEFAULT_PESOS_LIMIT = 0;
  export const DEFAULT_DOLARES_LIMIT = 1;
  export const DEFAULT_ITEMS_PER_PAGE = 20;
  export const DEFAULT_MOBILE_ITEMS_PER_PAGE = 10;
  
  // Singleton para la conexión Socket.io
  let socketInstance = null;
  
  // Función para obtener una instancia única de Socket.io
  export const getSocketInstance = (io) => {
    if (!socketInstance) {
      console.log('Creando nueva instancia de socket para:', API_URL);
      socketInstance = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });
      
      // Manejar errores de conexión
      socketInstance.on('connect_error', (error) => {
        console.error('Error de conexión al socket:', error);
      });
      
      // Logging de conectado/desconectado
      socketInstance.on('connect', () => {
        console.log('Socket.io conectado exitosamente');
      });
      
      socketInstance.on('disconnect', (reason) => {
        console.log('Socket.io desconectado:', reason);
      });
    }
    
    return socketInstance;
  };
  
  // Función para limpiar la instancia de socket
  export const cleanupSocketInstance = () => {
    if (socketInstance) {
      console.log('Limpiando instancia de socket');
      socketInstance.disconnect();
      socketInstance = null;
    }
  };