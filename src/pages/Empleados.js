import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CardHeader, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Header } from '../components/Header';
import { Link } from 'react-router-dom';

// Selección dinámica del endpoint
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_HOST_HEROKU
  : process.env.NODE_ENV === 'vercel'
  ? process.env.REACT_APP_HOST_VERCEL
  : process.env.REACT_APP_HOST_LOCAL;

export default function GestionEmpleados() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ nombre: '' });
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  };

  const handleAddEmployee = async () => {
    if (newEmployee.nombre) {
      try {
        const response = await axios.post(`${API_URL}/employees`, newEmployee);
        setEmployees([...employees, response.data]);
        setNewEmployee({ nombre: '' });
        handleCloseAddDialog();
      } catch (error) {
        console.error('Error al agregar empleado:', error);
      }
    }
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleOpenDeleteDialog = (empleado) => {
    setEmployeeToDelete(empleado);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      try {
        const response = await fetch(`${API_URL}/employees/${employeeToDelete.empleado_id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEmployees((prevEmpleados) =>
            prevEmpleados.filter((empleado) => empleado.empleado_id !== employeeToDelete.empleado_id)
          );
          handleCloseDeleteDialog();
        } else {
          console.error('Error al eliminar el empleado.');
        }
      } catch (error) {
        console.error('Error al eliminar el empleado:', error);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const newEmployees = data.slice(1).map((row) => ({ nombre: row[0] }));

      try {
        await axios.post(`${API_URL}/employees/upload`, { employees: newEmployees });
        fetchEmployees();
      } catch (error) {
        console.error('Error al cargar empleados desde Excel:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <div className='container'>
        <Link to="/conversion">
          <Button variant="contained" color="primary" style={{ margin: '20px' }}>
            Volver a Conversión
          </Button>
        </Link>
      </div>

      <Card sx={{ maxWidth: '80%', margin: '0 auto' }}>
        <CardHeader
          title="Gestión de Personal de Extracciones"
          titleTypographyProps={{ variant: 'h5', align: 'center' }}
        />
        <CardContent>
          <form style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <TextField
              label="Nombre del Empleado"
              variant="outlined"
              value={newEmployee.nombre}
              onChange={(e) => setNewEmployee({ ...newEmployee, nombre: e.target.value })}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
              Agregar Empleado
            </Button>
          </form>

          <div style={{ marginBottom: '1rem' }}>
            <Typography variant="subtitle1" gutterBottom>
              Cargar Empleados desde Excel
            </Typography>
            <Button
              variant="outlined"
              component="label"
            >
              Subir archivo
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                hidden
              />
            </Button>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((empleado) => (
                  <TableRow key={empleado.empleado_id}>
                    <TableCell>{empleado.nombre}</TableCell>
                    <TableCell>
                      <Button color="secondary" onClick={() => handleOpenDeleteDialog(empleado)}>Remover</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>

        {/* Modal de Confirmación para eliminar */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar al empleado {employeeToDelete?.nombre}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="primary">Eliminar</Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Confirmación para agregar */}
        <Dialog
          open={isAddDialogOpen}
          onClose={handleCloseAddDialog}
        >
          <DialogTitle>Confirmar Agregar Empleado</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas agregar al empleado {newEmployee.nombre}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Cancelar</Button>
            <Button onClick={handleAddEmployee} color="primary">Agregar</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
}
