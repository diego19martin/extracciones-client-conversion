// src/App.js - Versión actualizada con Dashboard Administrativo
import React, { useEffect, useState, useCallback } from 'react';
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Conversion from './pages/Conversion.js';
import Extracciones from './pages/Extracciones.js';
import GestionEmpleados from './pages/Empleados.js';
import AdminDashboard from './pages/AdminDashboard.js'; // Nuevo dashboard administrativo
import TesoreroDashboard from './pages/TesoreroDashboard.js';
import JefeJuego from './pages/JefeJuego.js';
import NavigationBar from './components/NavigationBar.js';
import { Box, CircularProgress, Typography } from '@mui/material';
import Login from './components/Login/Login.js';
import Register from './components/Register/Register.js';
import { useAuth } from './context/AuthContext';

export const App = () => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // Efecto una sola vez para asegurarse de que la app espere a que cargue la autenticación
  useEffect(() => {
    if (!loading) {
      setInitialized(true);
    }
  }, [loading]);

  // Función para determinar la ruta de redirección según roles
  const getUserHomePage = useCallback(() => {
    if (!user || !user.roles || user.roles.length === 0) {
      return '/login';
    }
    
    // DEBUGGING: Mostrar los roles del usuario actual
    console.log('App.js - Roles del usuario actual:', user.roles);
    
    // Verificar cada rol individualmente para evitar problemas con el mapeo
    if (user.roles.includes('admin')) {
      console.log('App.js - Usuario tiene rol admin, redirigiendo a /dashboard');
      return '/dashboard'; // Los administradores van al nuevo dashboard administrativo
    }
    
    if (user.roles.includes('jefe_juego')) {
      console.log('App.js - Usuario tiene rol jefe_juego, redirigiendo a /jefejuego');
      return '/jefejuego';
    }
    
    if (user.roles.includes('tesoreria')) {
      console.log('App.js - Usuario tiene rol tesoreria, redirigiendo a /tesorero');
      return '/tesorero';
    }
    
    if (user.roles.includes('extracciones')) {
      console.log('App.js - Usuario tiene rol extracciones, redirigiendo a /extracciones');
      return '/extracciones';
    }
    
    if (user.roles.includes('conversion')) {
      console.log('App.js - Usuario tiene rol conversion, redirigiendo a /conversion');
      return '/conversion';
    }
    
    // Si no se encontró ningún rol específico, usar dashboard general
    console.log('App.js - No se encontró un rol específico, usando dashboard por defecto');
    return '/dashboard';
  }, [user]);

  // No renderizar nada hasta que la autenticación se haya verificado
  if (!initialized) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando aplicación...
        </Typography>
      </Box>
    );
  }

  // Componente Layout para rutas autenticadas
  const AuthenticatedLayout = ({ children }) => (
    <>
      <NavigationBar />
      <Box sx={{ flexGrow: 1, mt: 2, mb: 4 }}>
        {children}
      </Box>
    </>
  );

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getUserHomePage()} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={getUserHomePage()} replace />} />
      
      {/* Rutas protegidas */}
      
      {/* Dashboard Administrativo - Solo para administradores */}
      <Route path="/dashboard" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('jefe_juego') ?
          <Navigate to={getUserHomePage()} replace /> :
        <AuthenticatedLayout>
          <AdminDashboard /> {/* Nuevo componente de Dashboard Administrativo */}
        </AuthenticatedLayout>
      } />
      
      <Route path="/conversion" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('conversion') && !hasRole('tesoreria') ?
          <Navigate to={getUserHomePage()} replace /> :
        <AuthenticatedLayout>
          <Conversion />
        </AuthenticatedLayout>
      } />
      
      <Route path="/extracciones" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('extracciones') && !hasRole('jefe_juego') ?
          <Navigate to={getUserHomePage()} replace /> :
        <AuthenticatedLayout>
          <Extracciones />
        </AuthenticatedLayout>
      } />
      
      <Route path="/tesorero" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('tesoreria') ?
          <Navigate to={getUserHomePage()} replace /> :
        <AuthenticatedLayout>
          <TesoreroDashboard />
        </AuthenticatedLayout>
      } />
      
      <Route path="/jefejuego" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('jefe_juego') ?
          <Navigate to={getUserHomePage()} replace /> :
        <AuthenticatedLayout>
          <JefeJuego />
        </AuthenticatedLayout>
      } />
      
      <Route path="/employees" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('jefe_juego') ?
          <Navigate to={getUserHomePage()} replace /> :
        <AuthenticatedLayout>
          <GestionEmpleados />
        </AuthenticatedLayout>
      } />
      
      {/* Ruta principal */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        <Navigate to={getUserHomePage()} replace />
      } />
      
      {/* Ruta para página no encontrada */}
      <Route path="*" element={<Navigate to={user ? getUserHomePage() : '/login'} replace />} />
    </Routes>
  );
};

export default App;