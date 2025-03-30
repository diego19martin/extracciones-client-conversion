// src/components/ProtectedRoute/ProtectedRoute.js
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading, hasAccess, hasRole } = useAuth();
  const location = useLocation();
  
  // Para depuración - Ayuda a identificar problemas en las redirecciones
  useEffect(() => {
    console.log('ProtectedRoute: Renderizando con path:', location.pathname);
    console.log('Usuario actual:', user);
    
    if (user) {
      console.log('Roles del usuario:', user.roles);
      console.log('¿Tiene acceso general?', hasAccess(location.pathname));
      
      // Verificar roles específicos si se requieren
      if (requiredRoles.length > 0) {
        console.log('Roles requeridos:', requiredRoles);
        const hasRequiredRole = requiredRoles.some(role => hasRole(role));
        console.log('¿Tiene alguno de los roles requeridos?', hasRequiredRole);
      }
    }
  }, [location.pathname, user, hasAccess, hasRole, requiredRoles]);
  
  // Mostrar indicador de carga
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verificando acceso...
        </Typography>
      </Box>
    );
  }
  
  // Verificar autenticación
  if (!user) {
    console.log('Usuario no autenticado. Redirigiendo a login.');
    // Redirigir a login y guardar ubicación para redirección posterior
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar roles requeridos (solo si se especificaron)
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      console.log('Usuario no tiene los roles requeridos:', requiredRoles);
      
      // IMPORTANTE: Redirigir al usuario a su dashboard específico según su rol
      // en lugar de redirigir siempre a /dashboard (lo que podría causar un bucle)
      
      // Determinar ruta de redirección basada en el rol principal
      let redirectPath = '/login'; // Fallback seguro
      
      if (user && user.roles && user.roles.length > 0) {
        // Verificar si el usuario tiene algún rol con dashboard asignado
        if (user.defaultDashboard) {
          // Si el usuario ya tiene un dashboard predeterminado, usarlo
          redirectPath = user.defaultDashboard;
        } else if (user.roles.includes('extracciones')) {
          redirectPath = '/extracciones';
        } else if (user.roles.includes('tesorero')) {
          redirectPath = '/tesorero';
        } else if (user.roles.includes('conversion')) {
          redirectPath = '/conversion';
        }
      }
      
      // Solo redirigir si la ruta de redirección es diferente a la ruta actual
      // Esto evita bucles infinitos de redirección
      if (redirectPath !== location.pathname) {
        console.log(`Redirigiendo a: ${redirectPath}`);
        return <Navigate to={redirectPath} replace />;
      } else {
        // Si intentaríamos redirigir a la misma ruta, mostrar un mensaje de error
        // en lugar de causar un bucle infinito
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              bgcolor: '#ffebee' // Fondo rojo claro
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Error de Acceso
            </Typography>
            <Typography variant="body1" align="center" sx={{ maxWidth: 600, mb: 2 }}>
              No tiene los permisos necesarios para acceder a esta página.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacte al administrador si cree que esto es un error.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 3 }}
              onClick={() => Navigate('/login')}
            >
              Volver a Iniciar Sesión
            </Button>
          </Box>
        );
      }
    }
  }
  
  // Verificar acceso a la ruta específica
  if (!hasAccess(location.pathname)) {
    console.log('Usuario no tiene acceso a:', location.pathname);
    
    // Si no tiene acceso a esta ruta específica, redirigir a su dashboard por defecto
    if (user.defaultDashboard && user.defaultDashboard !== location.pathname) {
      return <Navigate to={user.defaultDashboard} replace />;
    }
    
    // Si no hay dashboard predeterminado o es el mismo que la ruta actual,
    // redirigir a login para evitar bucles
    return <Navigate to="/login" replace />;
  }
  
  // Si todo está bien, mostrar el componente hijo
  return children;
};

export default ProtectedRoute;