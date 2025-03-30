// src/services/auth.service.js
import axios from 'axios';

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU // Heroku en producción
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL // Vercel en producción
  : process.env.REACT_APP_HOST_LOCAL || 'http://localhost:4000'; // Localhost en desarrollo

/**
 * Servicio para manejar las operaciones de autenticación
 */
export const AuthService = {
  /**
   * Iniciar sesión de usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async login(username, password) {
    try {
      console.log('AuthService: Intentando login con', username);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });
      
      console.log('AuthService: Respuesta de login obtenida:', {
        success: response.data.success,
        user: response.data.data?.user,
        rolesCount: response.data.data?.roles?.length,
        roles: response.data.data?.roles
      });
      
      // Procesar y transformar los datos para mantener consistencia
      if (response.data && response.data.success && response.data.data) {
        const { user, roles, modules, token } = response.data.data;
        
        // Extraer solo los nombres de los roles para usarlos más fácilmente
        const roleNames = roles.map(role => role.role_nombre);
        console.log('AuthService: Nombres de roles extraídos:', roleNames);
        
        // Crear una copia de la respuesta con los roles procesados
        const processedResponse = {
          ...response.data,
          data: {
            ...response.data.data,
            roles: roleNames
          }
        };
        
        return processedResponse;
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService: Error en login:', error);
      throw error;
    }
  },
  
  /**
   * Verificar el token actual
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async verifyToken() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token almacenado');
      }
      
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('AuthService: Error al verificar token:', error);
      throw error;
    }
  },
  
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('AuthService: Error en registro:', error);
      throw error;
    }
  },
  
  /**
   * Salir de la sesión (solo limpia datos locales)
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    
    // También eliminar de los headers de axios
    delete axios.defaults.headers.common['Authorization'];
    
    return true;
  },
  
  /**
   * Obtener la ruta de dashboard según los roles
   * @param {Array} roles - Array de roles del usuario
   * @returns {string} - Ruta del dashboard
   */
  getDefaultDashboard(roles) {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return '/dashboard';
    }
    
    // Mapeo de roles a dashboards
    const dashboards = {
      'admin': '/dashboard',
      'jefe_juego': '/dashboard',
      'extracciones': '/extracciones',
      'tesoreria': '/tesorero',
      'conversion': '/conversion'
    };
    
    // Prioridades (menor número = mayor prioridad)
    const priorities = {
      'admin': 1,
      'jefe_juego': 2,
      'tesoreria': 3,
      'conversion': 4,
      'extracciones': 5
    };
    
    // Ordenar roles por prioridad
    const sortedRoles = [...roles].sort((a, b) => 
      (priorities[a] || 999) - (priorities[b] || 999)
    );
    
    // Usar el dashboard del rol de mayor prioridad
    const primaryRole = sortedRoles[0];
    
    console.log('AuthService: Rol primario detectado:', primaryRole);
    console.log('AuthService: Dashboard correspondiente:', dashboards[primaryRole] || '/dashboard');
    
    return dashboards[primaryRole] || '/dashboard';
  }
};

export default AuthService;