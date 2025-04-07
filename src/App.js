// src/App.js - Versión corregida
import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import Conversion from './pages/conversion.js';
import Extracciones from './pages/Extracciones.js';
import GestionEmpleados from './pages/Empleados.js';
import AdminDashboard from './pages/AdminDashboard.js';
import TesoreroDashboard from './pages/TesoreroDashboard.js';
import JefeJuego from './pages/JefeJuego.js';
import NavigationBar from './components/NavigationBar.js';
import { Box, CircularProgress, Typography } from '@mui/material';
import Login from './components/Login/Login.js';
import Register from './components/Register/Register.js';
import { useAuth } from './context/AuthContext';

export const App = () => {
  const { user, loading, hasRole, getUserDashboard } = useAuth();
  const [initialized, setInitialized] = useState(false);

  // Efecto para marcar la inicialización una vez que la autenticación haya cargado
  useEffect(() => {
    if (!loading) {
      setInitialized(true);
    }
  }, [loading]);

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
      <Route path="/login" element={
        user ? <Navigate to={getUserDashboard()} replace /> : <Login />
      } />
      
      <Route path="/register" element={
        user ? <Navigate to={getUserDashboard()} replace /> : <Register />
      } />
      
      {/* Rutas protegidas */}
      <Route path="/dashboard" element={
        !user ? <Navigate to="/login" replace /> :
        <AuthenticatedLayout>
          <AdminDashboard />
        </AuthenticatedLayout>
      } />
      
      <Route path="/conversion" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('conversion') && !hasRole('tesoreria') ?
          <Navigate to={getUserDashboard()} replace /> :
        <AuthenticatedLayout>
          <Conversion />
        </AuthenticatedLayout>
      } />
      
      <Route path="/extracciones" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('extracciones') && !hasRole('jefe_juego') ?
          <Navigate to={getUserDashboard()} replace /> :
        <AuthenticatedLayout>
          <Extracciones />
        </AuthenticatedLayout>
      } />
      
      <Route path="/tesorero" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('tesoreria') ?
          <Navigate to={getUserDashboard()} replace /> :
        <AuthenticatedLayout>
          <TesoreroDashboard />
        </AuthenticatedLayout>
      } />
      
      <Route path="/jefejuego" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('jefe_juego') ?
          <Navigate to={getUserDashboard()} replace /> :
        <AuthenticatedLayout>
          <JefeJuego />
        </AuthenticatedLayout>
      } />
      
      <Route path="/employees" element={
        !user ? <Navigate to="/login" replace /> :
        !hasRole('admin') && !hasRole('jefe_juego') ?
          <Navigate to={getUserDashboard()} replace /> :
        <AuthenticatedLayout>
          <GestionEmpleados />
        </AuthenticatedLayout>
      } />
      
      {/* Ruta principal */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        <Navigate to={getUserDashboard()} replace />
      } />
      
      {/* Ruta para página no encontrada */}
      <Route path="*" element={
        <Navigate to={user ? getUserDashboard() : '/login'} replace />
      } />
    </Routes>
  );
};

export default App;