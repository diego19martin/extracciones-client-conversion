import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Slider, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper
} from '@mui/material';
import { getTable, postConfig, postGenerateReport, postMaquinas } from '../api/conversion.api';
import Swal from 'sweetalert2';
import io from 'socket.io-client';

function valuetext(value) {
  return `${value}°C`;
}

export default function Range({ props }) {
  const [valuePesos, setValuePesos] = useState(0);
  const [valueDolares, setValueDolares] = useState(1);
  const [resumen, setResumen] = useState([]);
  const [cant, setCant] = useState(0);
  const [total, setTotal] = useState(0);
  const [listadoFinal, setListadoFinal] = useState([]);
  const [dineroEnStacker, setDineroEnStacker] = useState(0);
  const [fecha, setFecha] = useState('');

  const [cantDolares, setCantDolares] = useState(0);
  const [totalDolares, setTotalDolares] = useState(0);
  const [dineroEnStackerDolares, setDineroEnStackerDolares] = useState(0);

  const [socket, setSocket] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const newSocket = io('http://localhost:4000');

    setSocket(newSocket);

    newSocket.on('connect_error', (error) => {
      console.error('Error de conexión al socket:', error);
    });
    

    newSocket.on('tableUpdate', handleTableUpdate);

    return () => {
      newSocket.off('tableUpdate', handleTableUpdate);
      newSocket.disconnect();
    };
  }, []);

  const handleTableUpdate = (updatedTable) => {
    console.log('Datos recibidos:', updatedTable);
    const listadoFiltrado = updatedTable.filter(item => 
      (item.moneda === 'pesos' && item.bill >= valuePesos) || 
      (item.moneda === 'dolares' && item.bill >= valueDolares)
    );
    
    console.log('listadofiltrado:', listadoFiltrado);
    
    setListadoFinal(listadoFiltrado);
    if (listadoFiltrado.length > 0) {
      setFecha(listadoFiltrado[0].fecha);
    }
    updateSummary(valuePesos, valueDolares, updatedTable);
  };

  const handleChangePesos = (event, newValue) => {
    setValuePesos(newValue);
    updateSummary(newValue, valueDolares, resumen);
  };

  const handleChangeDolares = (event, newValue) => {
    setValueDolares(newValue);
    updateSummary(valuePesos, newValue, resumen);
  };

  const updateSummary = (pesosValue, dolaresValue, data) => {
    let extraerPesos = 0;
    let sumTotalPesos = 0;
    let dineroEnStackerPesos = 0;
    let extraerDolares = 0;
    let sumTotalDolares = 0;
    let stackerDolares = 0;

    for (let i = 0; i < data.length; i++) {
      if (data[i].moneda === 'pesos') {
        if (data[i].bill >= pesosValue) {
          extraerPesos++;
          sumTotalPesos += data[i].bill;
        } else {
          dineroEnStackerPesos += data[i].bill;
        }
      } else if (data[i].moneda === 'dolares') {
        if (data[i].bill >= dolaresValue) {
          extraerDolares++;
          sumTotalDolares += data[i].bill;
        } else {
          stackerDolares += data[i].bill;
        }
      }
    }

    setCant(extraerPesos);
    setTotal(sumTotalPesos);
    setDineroEnStacker(dineroEnStackerPesos);
    setCantDolares(extraerDolares);
    setTotalDolares(sumTotalDolares);
    setDineroEnStackerDolares(stackerDolares);
  };

  const handleClick = async () => {
    setIsLoading(true);
    try {
        // Enviar la configuración y máquinas al backend junto con los límites
        await postMaquinas({ machines: resumen, valuePesos, valueDolares });

        // Confirmar la configuración de límites
        await postConfig({ valuePesos, valueDolares });

        // Después de confirmar, filtrar los datos nuevamente para reflejar los límites
        const updatedListado = resumen.filter(item => 
            (item.moneda === 'pesos' && item.bill >= valuePesos) || 
            (item.moneda === 'dolares' && item.bill >= valueDolares)
        );

        console.log(updatedListado);
        

        setListadoFinal(updatedListado); // Actualizar la lista de máquinas a mostrar

        Swal.fire({
            icon: 'success',
            title: 'Configuración confirmada',
            text: 'Los datos de límites en pesos y dólares han sido enviados correctamente.',
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar la configuración.',
        });
    } finally {
        setIsLoading(false);
    }
};

  

  useEffect(() => {
    setResumen(props);
    updateSummary(valuePesos, valueDolares, props);
  }, [props]);

  console.log(listadoFinal);

  const handleGenerateReport = async () => {
    setIsLoading(true); // Iniciar el estado de cargando
    try {
        // Realiza una petición al backend para generar y enviar el reporte
        await postGenerateReport();

        console.log('generateReport');
        

        Swal.fire({
            icon: 'success',
            title: 'Reporte generado',
            text: 'El reporte se ha generado y enviado correctamente.',
        });


    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al generar el reporte.',
        });
    } finally {
        setIsLoading(false); // Asegurar que el botón se habilite siempre
    }
};

  
  
  

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Configuración de Extracción de Casino
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ajuste los límites de extracción y revise el resumen
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography gutterBottom>Límite de dinero a extraer por máquina (Pesos)</Typography>
          <Slider
            value={valuePesos}
            onChange={handleChangePesos}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            min={0}
            max={100000}
            step={5000}
          />
          <Typography variant="body2" color="text.secondary">
            Límite seleccionado: ${valuePesos.toLocaleString('en-US')}
          </Typography>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography gutterBottom>Límite de dólares a extraer por máquina</Typography>
          <Slider
            value={valueDolares}
            onChange={handleChangeDolares}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            min={1}
            max={1000}
            step={5}
          />
          <Typography variant="body2" color="text.secondary">
            Límite seleccionado: ${valueDolares.toLocaleString('en-US')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Máquinas a extraer</Typography>
            <Typography variant="h6">{cant}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Total a extraer</Typography>
            <Typography variant="h6">${total.toLocaleString('en-US')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Dinero en stacker</Typography>
            <Typography variant="h6">${dineroEnStacker.toLocaleString('en-US')}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4, mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            Resumen de Máquinas en Dólares
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Máquinas a extraer (Dólares)</Typography>
            <Typography variant="h6">{cantDolares}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Total a extraer (Dólares)</Typography>
            <Typography variant="h6">${totalDolares.toLocaleString('en-US')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Dinero en stacker (Dólares)</Typography>
            <Typography variant="h6">${dineroEnStackerDolares.toLocaleString('en-US')}</Typography>
          </Box>
        </Box>

        <Button variant='contained' color='primary' onClick={handleClick} disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Confirmar configuración'}
        </Button>

        <Box sx={{ my: 4 }}>
    <Button
        variant='contained'
        color='secondary'
        onClick={handleGenerateReport}
        disabled={isLoading}
        sx={{ mt: 2 }}
    >
        {isLoading ? 'Generando reporte...' : 'Generar y enviar reporte'}
    </Button>
</Box>



        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Listado de Máquinas
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Máquina</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Asistente 1</TableCell>
                <TableCell>Asistente 2</TableCell>
                <TableCell>Extracción</TableCell>
                <TableCell>Comentario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listadoFinal.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: item.finalizado === 'Completa' ? 'rgba(134, 239, 172, 0.5)' : 
                                     item.finalizado === 'Pendiente' ? 'rgba(252, 165, 165, 0.5)' : 
                                     'transparent'
                  }}
                >
                  <TableCell component="th" scope="row">{index + 1}</TableCell>
                  <TableCell>{item.maquina || item.machine}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.asistente1 || '-'}</TableCell>
                  <TableCell>{item.asistente2 || '-'}</TableCell>
                  <TableCell>{item.finalizado || 'No iniciado'}</TableCell>
                  <TableCell>{item.comentario || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}