// src/components/NavigationBar.js
import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../context/AuthContext';

// Mapa de iconos para módulos
const moduleIcons = {
  'dashboard': <DashboardIcon />,
  'money': <MonetizationOnIcon />,
  'account_balance': <AccountBalanceIcon />,
  'sync_alt': <SyncAltIcon />,
  'people': <PeopleIcon />,
  'person_add': <PersonIcon />,
  'assessment': <AssessmentIcon />,
  'security': <SecurityIcon />
};

const NavigationBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, modules, logout, hasRole } = useAuth();

  // Si modules está disponible en el contexto, úsalos; de lo contrario, crear módulos basados en roles
  const userModules = useMemo(() => {
    if (modules && Array.isArray(modules) && modules.length > 0) {
      // Ordenar por el campo 'orden' si existe
      return [...modules].sort((a, b) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        return 0;
      });
    }
    
    // Módulos por defecto si no están disponibles en el contexto
    const defaultModules = [];
    
    // Dashboard Gerencial para admin y jefe_juego
    if (hasRole('admin') || hasRole('jefe_juego')) {
      defaultModules.push({
        module_id: 'dashboard',
        nombre: 'Dashboard Gerencial',
        ruta: '/dashboard',
        icono: 'dashboard',
        descripcion: 'Panel gerencial con métricas y estadísticas',
        orden: 1
      });
    }
    
    // Jefe de Juego
    if (hasRole('admin') || hasRole('jefe_juego')) {
      defaultModules.push({
        module_id: 'jefejuego',
        nombre: 'Jefe de Juego',
        ruta: '/jefejuego',
        icono: 'security',
        descripcion: 'Panel de control para jefe de juego',
        orden: 2
      });
    }
    
    // Extracciones
    if (hasRole('admin') || hasRole('jefe_juego') || hasRole('extracciones')) {
      defaultModules.push({
        module_id: 'extracciones',
        nombre: 'Extracciones',
        ruta: '/extracciones',
        icono: 'money',
        descripcion: 'Gestión de extracciones',
        orden: 3
      });
    }
    
    // Tesorería
    if (hasRole('admin') || hasRole('tesoreria')) {
      defaultModules.push({
        module_id: 'tesorero',
        nombre: 'Tesorería',
        ruta: '/tesorero',
        icono: 'account_balance',
        descripcion: 'Panel de tesorería',
        orden: 4
      });
    }
    
    // Conversión
    if (hasRole('admin') || hasRole('conversion') || hasRole('tesoreria')) {
      defaultModules.push({
        module_id: 'conversion',
        nombre: 'Conversión',
        ruta: '/conversion',
        icono: 'sync_alt',
        descripcion: 'Gestión de conversiones',
        orden: 5
      });
    }
    
    // Empleados
    if (hasRole('admin') || hasRole('jefe_juego')) {
      defaultModules.push({
        module_id: 'employees',
        nombre: 'Empleados',
        ruta: '/employees',
        icono: 'people',
        descripcion: 'Gestión de empleados',
        orden: 6
      });
    }
    
    return defaultModules;
  }, [modules, hasRole]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const getIconForModule = (iconName) => {
    return moduleIcons[iconName] || <DashboardIcon />;
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Avatar 
          sx={{ 
            width: 60, 
            height: 60, 
            mb: 1,
            bgcolor: 'white',
            color: 'primary.main',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <AccountCircleIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {user?.nombre || 'Usuario'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.roles?.map(role => role).join(', ')}
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {userModules.map((module) => (
          <ListItem 
            button 
            key={module.module_id || module.ruta} 
            component={Link} 
            to={module.ruta}
            selected={location.pathname === module.ruta}
            onClick={() => {
              if (isMobile) {
                setDrawerOpen(false);
              }
            }}
            sx={{
              bgcolor: location.pathname === module.ruta ? 'action.selected' : 'inherit',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <ListItemIcon>
              {getIconForModule(module.icono)}
            </ListItemIcon>
            <ListItemText primary={module.nombre} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          fullWidth
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Sistema Integral de Recaudación
          </Typography>

          {!isMobile && userModules.map((module) => (
            <Button
              key={module.module_id || module.ruta}
              color="inherit"
              component={Link}
              to={module.ruta}
              sx={{ 
                mx: 1,
                backgroundColor: location.pathname === module.ruta ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                }
              }}
              startIcon={getIconForModule(module.icono)}
            >
              {module.nombre}
            </Button>
          ))}

          <Tooltip title="Cuenta">
            <IconButton
              onClick={handleMenuClick}
              size="large"
              edge="end"
              color="inherit"
              aria-label="cuenta de usuario"
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'white',
                  color: 'primary.main',
                }}
              >
                {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Perfil</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móviles
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavigationBar;