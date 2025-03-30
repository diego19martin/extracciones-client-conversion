import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../context/AuthContext';

// Importar íconos para cada módulo
import MoneyIcon from '@mui/icons-material/Money';
import PeopleIcon from '@mui/icons-material/People';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';

// Mapeo de íconos para módulos
const moduleIcons = {
  'Extracciones': <MoneyIcon style={{ fontSize: 60 }} />,
  'Conversión': <SyncAltIcon style={{ fontSize: 60 }} />,
  'Empleados': <PeopleIcon style={{ fontSize: 60 }} />,
  'Tesorería': <AccountBalanceIcon style={{ fontSize: 60 }} />,
  'Administración': <SettingsIcon style={{ fontSize: 60 }} />
};

const Dashboard = () => {
  const { user, modules, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleModuleClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#657aff' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Extracciones
          </Typography>
          <Box>
            <IconButton
              onClick={handleClick}
              size="large"
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1">{user?.nombre} {user?.apellido}</Typography>
                <Typography variant="body2" color="textSecondary">{user?.username}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                Mi Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Bienvenido, {user?.nombre}
        </Typography>

        <Grid container spacing={4}>
          {modules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.module_id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleModuleClick(module.ruta)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    width: 100, 
                    height: 100, 
                    bgcolor: 'rgba(101, 122, 255, 0.1)',
                    borderRadius: '50%',
                    mb: 2
                  }}>
                    {moduleIcons[module.nombre] || <MoneyIcon style={{ fontSize: 60 }} />}
                  </Box>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {module.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.descripcion || `Acceder al módulo de ${module.nombre}`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;