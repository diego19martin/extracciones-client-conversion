// utils/apiUtils.js
export const determineBaseUrl = () => {
    // Verificar entorno basado en variables de entorno o ubicación actual
    const isProduction = process.env.NODE_ENV === 'production';
    const hostname = window.location.hostname;
    
    // Configurar URLs según el entorno
    if (isProduction) {
      if (hostname.includes('heroku')) {
        return 'https://extraccione-server.herokuapp.com';
      } else if (hostname.includes('vercel')) {
        return 'https://extracciones-client-conversion.vercel.app';
      }
      // Default production URL
      return 'https://extraccione-server.herokuapp.com';
    }
    
    // En desarrollo local, usar localhost
    return 'http://localhost:4000';
  };