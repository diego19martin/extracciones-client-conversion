import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Toolbar, Typography, AppBar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExtensionIcon from '@mui/icons-material/Extension';
import PeopleIcon from '@mui/icons-material/People';
import TransformIcon from '@mui/icons-material/Transform';

export const Header = () => {
  return (
    <AppBar position="static" className='headerConv'>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de extracciones
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/conversion"
            startIcon={<TransformIcon />}
          >
            Conversión
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/extracciones"
            startIcon={<ExtensionIcon />}
          >
            Extracciones
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/employees"
            startIcon={<PeopleIcon />}
          >
            Empleados
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/dashboard"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;