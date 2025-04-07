// src/context/AuthContext.js - Versión corregida
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';

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

// Determinar la URL base al iniciar
const API_URL = determineBaseUrl();

console.log('Inicializando API con URL:', API_URL);


// Mapeo de roles a dashboards específicos - Sin cambios
const ROLE_DASHBOARDS = {
  'admin': '/dashboard',
  'jefe_juego': '/jefejuego',
  'extracciones': '/extracciones',
  'tesoreria': '/tesorero', 
  'conversion': '/conversion'
};

// Mapeo de roles a módulos permitidos - Sin cambios
const ROLE_MODULES = {
  'admin': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/dashboard', icono: 'dashboard', descripcion: 'Panel principal' },
    { module_id: 2, nombre: 'Conversión', ruta: '/conversion', icono: 'sync_alt', descripcion: 'Gestión de conversiones' },
    { module_id: 3, nombre: 'Extracciones', ruta: '/extracciones', icono: 'money', descripcion: 'Control de extracciones' },
    { module_id: 4, nombre: 'Empleados', ruta: '/employees', icono: 'people', descripcion: 'Gestión de personal' },
    { module_id: 5, nombre: 'Tesorería', ruta: '/tesorero', icono: 'account_balance', descripcion: 'Control de tesorería' },
    { module_id: 6, nombre: 'Registro', ruta: '/register', icono: 'person_add', descripcion: 'Registro de usuarios' }
  ],
  'jefe_juego': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/jefejuego', icono: 'dashboard', descripcion: 'Panel principal' },
    { module_id: 3, nombre: 'Extracciones', ruta: '/extracciones', icono: 'money', descripcion: 'Control de extracciones' },
    { module_id: 4, nombre: 'Empleados', ruta: '/employees', icono: 'people', descripcion: 'Gestión de personal' }
  ],
  'extracciones': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/extracciones', icono: 'dashboard', descripcion: 'Panel principal' },
    { module_id: 3, nombre: 'Extracciones', ruta: '/extracciones', icono: 'money', descripcion: 'Control de extracciones' }
  ],
  'tesoreria': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/tesorero', icono: 'dashboard', descripcion: 'Panel principal' },
    { module_id: 5, nombre: 'Tesorería', ruta: '/tesorero', icono: 'account_balance', descripcion: 'Control de tesorería' },
    { module_id: 2, nombre: 'Conversión', ruta: '/conversion', icono: 'sync_alt', descripcion: 'Gestión de conversiones' }
  ],
  'conversion': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/conversion', icono: 'dashboard', descripcion: 'Panel principal' },
    { module_id: 2, nombre: 'Conversión', ruta: '/conversion', icono: 'sync_alt', descripcion: 'Gestión de conversiones' }
  ]
};

// Función para determinar el dashboard según el rol principal - Simplificada
const getDefaultDashboard = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return '/dashboard';
  }

  // Buscar el primer rol que tenga un dashboard asignado
  for (const role of roles) {
    if (ROLE_DASHBOARDS[role]) {
      return ROLE_DASHBOARDS[role];
    }
  }
  
  // Si no se encontró ningún rol con dashboard, usar el dashboard por defecto
  return '/dashboard';
};

// Crear contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto - Sin cambios
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto - Corregido
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authInitialized = useRef(false);

  // Verificar autenticación al cargar la aplicación - Simplificado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Recuperar datos de localStorage
        const storedToken = localStorage.getItem('token');
        const storedUserStr = localStorage.getItem('user');
        
        if (!storedToken || !storedUserStr) {
          // No hay token o usuario almacenado
          setUser(null);
          setModules([]);
          setLoading(false);
          return;
        }

        // Intentar parsear el usuario almacenado
        const storedUser = JSON.parse(storedUserStr);
        
        if (!storedUser) {
          throw new Error('Usuario almacenado inválido');
        }
        
        // Cargar módulos
        let userModules = [];
        
        // Si el usuario tiene roles, generar módulos basados en esos roles
        if (storedUser.roles && Array.isArray(storedUser.roles)) {
          storedUser.roles.forEach(role => {
            if (ROLE_MODULES[role]) {
              userModules = [...userModules, ...ROLE_MODULES[role]];
            }
          });
          
          // Eliminar duplicados
          userModules = userModules.filter((module, index, self) =>
            index === self.findIndex((m) => m.module_id === module.module_id)
          );
        }
        
        // Si no se especificó un dashboard predeterminado, agregarlo
        if (!storedUser.defaultDashboard && storedUser.roles && storedUser.roles.length > 0) {
          storedUser.defaultDashboard = getDefaultDashboard(storedUser.roles);
        }
        
        // Establecer estado
        setUser(storedUser);
        setModules(userModules);
      } catch (e) {
        console.error('Error al procesar datos de autenticación:', e);
        // Limpiar todo en caso de error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('modules');
        
        setUser(null);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Solo ejecutar una vez
    if (!authInitialized.current) {
      authInitialized.current = true;
      checkAuth();
    }
  }, []);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((role) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.includes(role);
  }, [user]);

  // Verificar si el usuario tiene acceso a una ruta
  const hasAccess = useCallback((path) => {
    // Sin usuario, solo acceso a rutas públicas
    if (!user) {
      return path === '/login' || path === '/register';
    }
    
    // Rutas públicas siempre accesibles
    if (path === '/login' || path === '/register') {
      return true;
    }
    
    // Acceso al dashboard predeterminado
    if (path === user.defaultDashboard || path === '/') {
      return true;
    }
    
    // Verificar en módulos permitidos
    return modules.some(module => module.ruta === path);
  }, [user, modules]);

  // Login función - Corregida
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Intentando iniciar sesión con:', username);
      console.log('URL de API:', `${API_URL}/auth/login`);
      
      // Petición al backend
      const response = await axios.post(`${API_URL}/auth/login`, { 
        username, 
        password 
      });
      
      console.log('Respuesta de login:', response.data);
      
      // Verificar respuesta
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Error al iniciar sesión');
      }
      
      const { user: userData, roles = [], token } = response.data.data;
      
      // Obtener nombres de roles
      const roleNames = Array.isArray(roles) ? roles.map(role => role.role_nombre) : [];
      
      // Determinar dashboard predeterminado
      const defaultDashboard = getDefaultDashboard(roleNames);
      
      // Preparar objeto de usuario
      const userWithRoles = {
        ...userData,
        roles: roleNames,
        defaultDashboard
      };
      
      // Generar módulos para el usuario
      let userModules = [];
      roleNames.forEach(role => {
        if (ROLE_MODULES[role]) {
          userModules = [...userModules, ...ROLE_MODULES[role]];
        }
      });
      
      // Eliminar duplicados
      userModules = userModules.filter((module, index, self) =>
        index === self.findIndex((m) => m.module_id === module.module_id)
      );
      
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRoles));
      localStorage.setItem('modules', JSON.stringify(userModules));
      
      // Actualizar estado
      setUser(userWithRoles);
      setModules(userModules);
      
      console.log('Login exitoso, usuario:', userWithRoles);
      return true;
    } catch (error) {
      console.error('Error de login:', error);
      
      const errorMsg = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout función - Simplificada
  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    
    // Limpiar estado
    setUser(null);
    setModules([]);
    
    // Indicar éxito
    return true;
  }, []);

  // Register función - Corregida
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Datos de registro:', userData);
      console.log('URL de API:', `${API_URL}/auth/register`);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta de registro:', response.data);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error de registro:', error);
      
      const errorMsg = error.response?.data?.message || error.message || 'Error al registrar usuario';
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener el dashboard predeterminado del usuario
  const getUserDashboard = useCallback(() => {
    if (!user) return '/login';
    
    // Si el usuario tiene un dashboard preestablecido, usarlo
    if (user.defaultDashboard) {
      return user.defaultDashboard;
    }
    
    // Si no tiene dashboard predefinido pero tiene roles, calcularlo
    if (user.roles && user.roles.length > 0) {
      return getDefaultDashboard(user.roles);
    }
    
    // Si no hay información suficiente, usar la ruta por defecto
    return '/dashboard';
  }, [user]);

  // Valor del contexto - Solo incluir valores estables o memoizados
  const value = {
    user,
    modules,
    loading,
    error,
    login,
    logout,
    register,
    hasAccess,
    hasRole,
    getUserDashboard
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;