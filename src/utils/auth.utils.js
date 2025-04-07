// src/auth.utils.js
// Utilidades para autenticación

// Mapeo de roles a dashboards específicos
export const ROLE_DASHBOARDS = {
    'admin': '/dashboard',
    'jefe_juego': '/jefejuego',
    'extracciones': '/extracciones',
    'tesoreria': '/tesorero', 
    'conversion': '/conversion'
  };
  
  // Prioridades de roles para determinar dashboard principal
  export const ROLE_PRIORITIES = {
    'admin': 1,
    'jefe_juego': 2,
    'tesoreria': 3,
    'conversion': 4,
    'extracciones': 5
  };
  
  /**
   * Determina el dashboard según el rol principal del usuario
   * @param {Array} roles - Arreglo de roles del usuario
   * @returns {string} Ruta del dashboard
   */
  export const getDefaultDashboard = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return '/dashboard';
    }
    
    // Ordenar los roles por prioridad
    const sortedRoles = [...roles].sort((a, b) => 
      (ROLE_PRIORITIES[a] || 999) - (ROLE_PRIORITIES[b] || 999)
    );
    
    const primaryRole = sortedRoles[0];
    return ROLE_DASHBOARDS[primaryRole] || '/dashboard';
  };
  
  /**
   * Obtiene los módulos permitidos para un conjunto de roles
   * @param {Array} roles - Arreglo de roles del usuario
   * @param {Object} roleModules - Mapeo de roles a módulos
   * @returns {Array} Arreglo de módulos permitidos sin duplicados
   */
  export const getUserModules = (roles, roleModules) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return [];
    }
    
    let userModules = [];
    
    roles.forEach(role => {
      if (roleModules[role]) {
        userModules = [...userModules, ...roleModules[role]];
      }
    });
    
    // Eliminar duplicados por module_id
    return userModules.filter((module, index, self) =>
      index === self.findIndex((m) => m.module_id === module.module_id)
    );
  };
  
  /**
   * Verifica si un token JWT ha expirado
   * @param {string} token - Token JWT
   * @returns {boolean} true si el token ha expirado
   */
  export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Extraer la parte del payload y decodificarla
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      const { exp } = JSON.parse(jsonPayload);
      
      // Comparar con la fecha actual
      return Date.now() >= exp * 1000;
    } catch (e) {
      console.error('Error al verificar expiración del token:', e);
      return true; // Si hay error, asumimos que el token es inválido
    }
  };
  
  /**
   * Elimina la información de autenticación del almacenamiento local
   */
  export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
  };