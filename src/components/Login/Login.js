import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Fade,
  styled
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';

// Componentes con estilos personalizados
const LoginCard = styled(Card)(({ theme }) => ({
  maxWidth: 430,
  width: '100%',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.2)',
  },
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
}));

const LoginHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6, 2, 4),
  textAlign: 'center',
  background: 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',
  marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto',
  backgroundColor: 'white',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  border: '3px solid white',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '15px',
    transition: 'all 0.3s ease',
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(101, 122, 255, 0.2)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: '15px',
  padding: '12px 0',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: '0 4px 10px rgba(101, 122, 255, 0.3)',
  background: 'linear-gradient(135deg, #657aff 0%, #5a6fe4 100%)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(101, 122, 255, 0.4)',
    background: 'linear-gradient(135deg, #5a6fe4 0%, #4b62d9 100%)',
    transform: 'translateY(-2px)',
  },
}));

const RegisterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.dark,
    textDecoration: 'underline',
  },
}));

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  const { login, user, error: authError, getUserDashboard } = useAuth();
  const navigate = useNavigate();

  // Efecto de fade-in al cargar
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Vigilar errores de autenticación del contexto
  useEffect(() => {
    if (authError) {
      setFormError(authError);
      setLoading(false);
    }
  }, [authError]);

  // Efecto simplificado para manejar redirección cuando el usuario está autenticado
  useEffect(() => {
    // Si hay un usuario autenticado, redirigir al dashboard correspondiente
    if (user) {
      console.log('Usuario autenticado, redirigiendo al dashboard');
      const dashboardRoute = getUserDashboard();
      console.log('Ruta de dashboard:', dashboardRoute);
      
      // Pequeño retraso para evitar problemas de estado
      const timer = setTimeout(() => {
        navigate(dashboardRoute, { replace: true });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate, getUserDashboard]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!username.trim()) {
      setFormError('El usuario es requerido');
      return;
    }
    
    if (!password) {
      setFormError('La contraseña es requerida');
      return;
    }
    
    setLoading(true);
    setFormError('');
    
    try {
      console.log('Intentando iniciar sesión con:', username);
      // El login actualiza el estado del usuario en el contexto si es exitoso
      const success = await login(username, password);
      
      if (!success) {
        setFormError('Credenciales incorrectas');
        setLoading(false);
      }
      // No hacemos nada más aquí - el useEffect se encargará de la redirección
      
    } catch (err) {
      console.error('Error durante el login:', err);
      setFormError('Error al iniciar sesión. Por favor intente nuevamente.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("./img/bg.jpg")',
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
          backdropFilter: 'blur(3px)',
        }
      }}
    >
      <Fade in={fadeIn} timeout={1000}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <LoginCard>
            <LoginHeader>
              <StyledAvatar>
                <LockOutlinedIcon sx={{ fontSize: 40, color: '#657aff' }} />
              </StyledAvatar>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  color: 'white', 
                  mt: 2, 
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Sistema Integral de Recaudación
              </Typography>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mt: 1,
                  fontWeight: 500
                }}
              >
                Hipódromo Argentino de Palermo
              </Typography>
              <Typography 
                variant="subtitle2"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mt: 0.5,
                  fontWeight: 400
                }}
              >
                Gerencia de Operaciones
              </Typography>
            </LoginHeader>
            
            <CardContent sx={{ px: 4, py: 3 }}>
              {formError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {formError}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Usuario"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  error={!!formError && !username.trim()}
                />
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  error={!!formError && !password}
                />
                
                <LoginButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 2, mb: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Iniciar Sesión'
                  )}
                </LoginButton>
                
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿Es su primera vez aquí?{' '}
                    <RegisterLink to="/register">
                      Crear una cuenta nueva
                    </RegisterLink>
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ 
                      color: 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                  >
                    © {new Date().getFullYear()} Hipódromo Argentino de Palermo
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      mt: 0.5,
                      color: 'rgba(0,0,0,0.5)',
                    }}
                  >
                    Sistema Integral de Recaudación
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </LoginCard>
        </Container>
      </Fade>
    </Box>
  );
};

export default Login;