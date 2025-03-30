// src/context/AuthContext.js - Corrección final
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';

// Configuración de la URL de la API
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU
  : process.env.NODE_ENV === 'vercel'
    ? process.env.REACT_APP_HOST_VERCEL
    : process.env.REACT_APP_HOST_LOCAL || 'http://localhost:4000';

// Mapeo de roles a dashboards específicos - CORREGIDO PARA COINCIDIR CON TU DB Y RUTAS
const ROLE_DASHBOARDS = {
  'admin': '/dashboard',
  'jefe_juego': '/jefejuego', // Ahora apunta a la ruta correcta /jefejuego
  'extracciones': '/extracciones',
  'tesoreria': '/tesorero', 
  'conversion': '/conversion'
};

// Mapeo de roles a módulos permitidos
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
    { module_id: 1, nombre: 'Dashboard', ruta: '/jefejuego', icono: 'dashboard', descripcion: 'Panel principal' }, // Cambio de /dashboard a /jefejuego
    { module_id: 3, nombre: 'Extracciones', ruta: '/extracciones', icono: 'money', descripcion: 'Control de extracciones' },
    { module_id: 4, nombre: 'Empleados', ruta: '/employees', icono: 'people', descripcion: 'Gestión de personal' }
  ],
  'extracciones': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/extracciones', icono: 'dashboard', descripcion: 'Panel principal' }, // Cambio directo a su módulo principal
    { module_id: 3, nombre: 'Extracciones', ruta: '/extracciones', icono: 'money', descripcion: 'Control de extracciones' }
  ],
  'tesoreria': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/tesorero', icono: 'dashboard', descripcion: 'Panel principal' }, // Cambio directo a su módulo principal
    { module_id: 5, nombre: 'Tesorería', ruta: '/tesorero', icono: 'account_balance', descripcion: 'Control de tesorería' },
    { module_id: 2, nombre: 'Conversión', ruta: '/conversion', icono: 'sync_alt', descripcion: 'Gestión de conversiones' }
  ],
  'conversion': [
    { module_id: 1, nombre: 'Dashboard', ruta: '/conversion', icono: 'dashboard', descripcion: 'Panel principal' }, // Cambio directo a su módulo principal
    { module_id: 2, nombre: 'Conversión', ruta: '/conversion', icono: 'sync_alt', descripcion: 'Gestión de conversiones' }
  ]
};

// Función para determinar el dashboard según el rol principal del usuario
const getDefaultDashboard = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return '/dashboard';
  }

  // Prioridades de roles
  const rolePriorities = {
    'admin': 1,
    'jefe_juego': 2,
    'tesoreria': 3,
    'conversion': 4,
    'extracciones': 5
  };

  // FUNCIÓN DE DEPURACIÓN
  console.log('Roles disponibles:', roles);
  
  // Verificar cada rol con el mapeo de dashboards
  for (const role of roles) {
    console.log(`Verificando rol: ${role} -> dashboard: ${ROLE_DASHBOARDS[role]}`);
  }

  // Ordenar los roles por prioridad
  const sortedRoles = [...roles].sort((a, b) => 
    (rolePriorities[a] || 999) - (rolePriorities[b] || 999)
  );
  
  console.log('Roles ordenados por prioridad:', sortedRoles);
  
  const primaryRole = sortedRoles[0];
  const dashboard = ROLE_DASHBOARDS[primaryRole] || '/dashboard';
  
  console.log('Rol primario:', primaryRole, '-> Dashboard seleccionado:', dashboard);
  
  return dashboard;
};

// Crear contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigationBlockerRef = useRef(false); // Para evitar navegaciones en bucle
  
  // Verificar autenticación al cargar la aplicación - Una sola vez
  useEffect(() => {
    const checkAuth = () => {
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

        try {
          // Intentar parsear el usuario almacenado
          const storedUser = JSON.parse(storedUserStr);
          
          if (!storedUser) {
            throw new Error('Usuario almacenado inválido');
          }
          
          // Cargar módulos desde localStorage o usar fallback
          const storedModulesStr = localStorage.getItem('modules');
          let userModules = [];
          
          if (storedModulesStr) {
            try {
              const parsedModules = JSON.parse(storedModulesStr);
              if (Array.isArray(parsedModules)) {
                userModules = parsedModules;
              }
            } catch (e) {
              console.error('Error al parsear módulos:', e);
            }
          }
          
          // Si no hay módulos almacenados, usar fallback basado en roles
          if (userModules.length === 0 && storedUser.roles) {
            const userRoles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
            
            userRoles.forEach(role => {
              if (ROLE_MODULES[role]) {
                userModules = [...userModules, ...ROLE_MODULES[role]];
              }
            });
            
            // Eliminar duplicados
            userModules = userModules.filter((module, index, self) =>
              index === self.findIndex((m) => m.module_id === module.module_id)
            );

            // Guardar los módulos en localStorage para evitar recalcular
            localStorage.setItem('modules', JSON.stringify(userModules));
          }
          
          // Si no se especificó un dashboard predeterminado, agregarlo
          const userRoles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
          
          if (!storedUser.defaultDashboard && userRoles.length > 0) {
            storedUser.defaultDashboard = getDefaultDashboard(userRoles);
            // Actualizar en localStorage
            localStorage.setItem('user', JSON.stringify(storedUser));
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
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Versión memoizada de hasRole para evitar recreaciones
  const hasRole = useCallback((role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  // Versión memoizada de hasAccess para evitar recreaciones
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

  // Login función
  const login = useCallback(async (username, password) => {
    if (navigationBlockerRef.current) {
      console.log('Operación bloqueada para evitar bucles');
      return false;
    }
    
    navigationBlockerRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Petición al backend
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        username, 
        password 
      });
      
      // Verificar respuesta
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Error al iniciar sesión');
      }
      
      const { user: userData, roles = [], modules: userModules = [], token } = response.data.data;
      
      // Obtener nombres de roles
      const roleNames = Array.isArray(roles) ? roles.map(role => role.role_nombre) : [];
      
      // DEBUGGING: Mostrar los roles que vienen del backend
      console.log('Roles recibidos del backend:', roleNames);
      
      // Determinar dashboard predeterminado
      const defaultDashboard = getDefaultDashboard(roleNames);
      console.log('Dashboard predeterminado calculado:', defaultDashboard);
      
      // Preparar objeto de usuario
      const userWithRoles = {
        ...userData,
        roles: roleNames,
        defaultDashboard
      };
      
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithRoles));
      localStorage.setItem('modules', JSON.stringify(userModules));
      
      // Actualizar estado
      setUser(userWithRoles);
      setModules(userModules);
      
      return true;
    } catch (error) {
      console.error('Error de login:', error);
      
      const errorMsg = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => {
        navigationBlockerRef.current = false;
      }, 1000); // Desbloquear después de 1 segundo
    }
  }, []);

  // Logout función - No usa navigate directamente
  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    
    // Limpiar estado
    setUser(null);
    setModules([]);
    
    // La redirección debe hacerse en el componente que llama a logout
    return true;
  }, []);

  // Register función
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
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
      console.log('Usando dashboard predefinido:', user.defaultDashboard);
      return user.defaultDashboard;
    }
    
    // Si no tiene dashboard predefinido pero tiene roles, calcularlo
    if (user.roles && user.roles.length > 0) {
      const dashboard = getDefaultDashboard(user.roles);
      console.log('Calculando dashboard para roles:', user.roles, '->', dashboard);
      return dashboard;
    }
    
    // Si no hay información suficiente, usar la ruta por defecto
    console.log('Sin información suficiente, usando dashboard por defecto');
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