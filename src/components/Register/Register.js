// src/components/Login/Register.js
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
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  FormHelperText,
  Divider,
  Fade,
  styled
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import 'animate.css';

// Componentes estilizados
const RegisterCard = styled(Card)(({ theme }) => ({
  maxWidth: 700,
  width: '100%',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.2)',
  },
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
}));

const RegisterHeader = styled(Box)(({ theme }) => ({
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

const RegisterButton = styled(Button)(({ theme }) => ({
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

const CancelButton = styled(Button)(({ theme }) => ({
  borderRadius: '15px',
  padding: '12px 0',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-2px)',
  },
}));

const LoginLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 600,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.dark,
    textDecoration: 'underline',
  },
}));

// Lista de roles disponibles actualizada con mapeo a IDs
const AVAILABLE_ROLES = [
  { value: 'extracciones', label: 'Extracciones', id: 2 },
  { value: 'jefe_juego', label: 'Jefe de Juego', id: 3 },
  { value: 'conversion', label: 'Conversión', id: 4 },
  { value: 'tesoreria', label: 'Tesorero', id: 5 }
];

// Mapeo directo para convertir nombres a IDs
const ROLE_ID_MAP = {
  'extracciones': 2,
  'jefe_juego': 3,
  'conversion': 4,
  'tesoreria': 5
};

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: []
  });
  
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Efecto de fade-in al cargar
  useEffect(() => {
    setFadeIn(true);
  }, []);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar errores al cambiar el valor
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Manejar cambios en el campo de roles (ahora selección simple)
  const handleRoleChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, roles: [value] }); // Guarda como array con un solo valor
    
    if (errors.roles) {
      setErrors({ ...errors, roles: '' });
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido) newErrors.apellido = 'El apellido es requerido';
    
    if (!formData.email) newErrors.email = 'El email es requerido';
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = 'Ingresa un email válido';
    }
    
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    
    if (!formData.roles || formData.roles.length === 0) newErrors.roles = 'Selecciona un rol';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Generar nombre de usuario usando 2 primeras letras del nombre + apellido
  const generateUsername = (nombre, apellido) => {
    if (!nombre || !apellido) return '';
    
    // Normalizar: convertir a minúsculas, eliminar espacios y acentos
    const normalizeText = (text) => {
      return text.toLowerCase()
        .replace(/\s+/g, '')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };
    
    const normalizedNombre = normalizeText(nombre);
    const normalizedApellido = normalizeText(apellido);
    
    // Usar dos primeras letras del nombre + apellido completo
    return normalizedNombre.substring(0, 2) + normalizedApellido;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Generar username con la primera letra del nombre + apellido completo (en minúscula)
      const generatedUsername = generateUsername(formData.nombre, formData.apellido);
      
      // Convertir los roles seleccionados a IDs para el backend (ahora solo hay uno)
      const roleIds = formData.roles.map(role => ROLE_ID_MAP[role]).filter(id => id);
      
      const userData = {
        ...formData,
        username: generatedUsername,
        roles: roleIds
      };
      
      console.log('Datos a enviar:', userData);
      
      const result = await register(userData);
      
      if (result?.success) {
        setSuccess(true);
        
        Swal.fire({
          icon: 'success',
          title: '¡Usuario registrado con éxito!',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p><strong>Nombre:</strong> ${formData.nombre} ${formData.apellido}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Nombre de usuario:</strong> ${generatedUsername}</p>
              <p><strong>Rol:</strong> ${formData.roles.map(role => {
                const roleObj = AVAILABLE_ROLES.find(r => r.value === role);
                return roleObj ? roleObj.label : role;
              }).join('')}</p>
            </div>
          `,
          confirmButtonText: 'Ir a iniciar sesión',
          confirmButtonColor: '#657aff'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
      } else {
        // Si hay un mensaje de error específico del backend, mostrarlo
        setError(result?.message || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Error detallado:', err);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al registrar usuario';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error de registro',
        text: errorMessage
      });
    } finally {
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
        py: 4,
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
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <RegisterCard>
            <RegisterHeader>
              <StyledAvatar>
                <PersonAddIcon sx={{ fontSize: 40, color: '#657aff' }} />
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
                Registro de Nuevo Usuario
              </Typography>
            </RegisterHeader>
            
            <CardContent sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      required
                      fullWidth
                      id="nombre"
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      error={!!errors.nombre}
                      helperText={errors.nombre}
                      disabled={loading || success}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      required
                      fullWidth
                      id="apellido"
                      label="Apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      error={!!errors.apellido}
                      helperText={errors.apellido}
                      disabled={loading || success}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <StyledTextField
                      required
                      fullWidth
                      id="email"
                      label="Correo Electrónico"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={loading || success}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      required
                      fullWidth
                      id="password"
                      label="Contraseña"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      disabled={loading || success}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      required
                      fullWidth
                      id="confirmPassword"
                      label="Confirmar Contraseña"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      disabled={loading || success}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      required 
                      margin="normal"
                      error={!!errors.roles}
                      disabled={loading || success}
                    >
                      <InputLabel id="roles-label">Rol</InputLabel>
                      <Select
                        labelId="roles-label"
                        id="roles"
                        name="roles"
                        value={formData.roles[0] || ''}  // Solo un valor
                        onChange={handleRoleChange}
                        input={<OutlinedInput id="select-role" label="Rol" />}
                        renderValue={(selected) => {
                          const role = AVAILABLE_ROLES.find(r => r.value === selected);
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip 
                                key={selected} 
                                label={role ? role.label : selected} 
                                sx={{ 
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                  fontWeight: 500
                                }} 
                              />
                            </Box>
                          );
                        }}
                        sx={{ borderRadius: '15px' }}
                      >
                        {AVAILABLE_ROLES.map((role) => (
                          <MenuItem key={role.value} value={role.value}>
                            {role.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.roles && <FormHelperText>{errors.roles}</FormHelperText>}
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <CancelButton
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/login')}
                    disabled={loading || success}
                    fullWidth
                  >
                    Cancelar
                  </CancelButton>
                  
                  <RegisterButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || success}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Registrar Usuario'}
                  </RegisterButton>
                </Box>
                
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿Ya tiene una cuenta?{' '}
                    <LoginLink to="/login">
                      Iniciar sesión
                    </LoginLink>
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ textAlign: 'center' }}>
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
          </RegisterCard>
        </Container>
      </Fade>
    </Box>
  );
};

export default Register;