import {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { postConfig, postMaquinas } from '../api/conversion.api';
import BootstrapTable from 'react-bootstrap-table-next';
import Swal from 'sweetalert2'


function valuetext(value) {
  return `${value}°C`;
}


export default function Range(items) {

  // console.log(items);

  var extraer = 0;
  var sumTotal = 0;

  const [value, setValue] = useState(0);
  const [Resumen, setResumen] = useState([0]);
  const [cant, SetCant] = useState(0);
  const [Total, SetTotal] = useState(0)
  const [listadoFinal, setListadoFinal] = useState([{maquina: 1}])
  const [Restante, setRestante] = useState(0);
  const [NoPudo, setNoPudo] = useState(0);

  const handleChange = (event, newValue) => {

    setResumen(items)

    setValue(newValue);

   
    var i = 0;
    var listadoExtraer = [];

    console.log(Resumen.props);

    for (i=0; i<Resumen.props.length; i++) {
      if (Resumen.props[i].bill > value) {
        // console.log(Resumen.props[i].bill);
        extraer ++
        sumTotal = sumTotal + Resumen.props[i].bill
        listadoExtraer.push(
          {
            'maquina' : Resumen.props[i].machine,
            'location' : Resumen.props[i].location,
            'bill' : Resumen.props[i].bill,
            'fecha' : Resumen.props[i].fecha,
            'estado': 'Pendiente'
          } 
        )
      }
    }

    console.log(listadoExtraer);
    
    // console.log(value);
    SetCant(extraer);
    SetTotal(sumTotal);
    setListadoFinal(listadoExtraer);

    // console.log('Cantidad de maquinas a extraer ' + extraer);
    // console.log('Total de dinero a extraer $' + sumTotal);


  };



  function handleClick() {
    // console.log(value);
    // console.log(listadoFinal);
    console.log(Resumen);
    postMaquinas(Resumen.props);
    console.log(listadoFinal.length);
    if(listadoFinal.length>1){ 
      postConfig(value);
      
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Atención!',
        text: 'No hay archivo seleccionado',
      })
    }
    
  }

  var totalFormat = Total.toLocaleString('en-US');
  console.log(totalFormat);

  const columns = [{
    dataField: 'maquina',
    text: 'Máquina',
    headerStyle: {
      backgroundColor: '#8ec9ff'
    }
    },
    {
      dataField: 'location',
      text: 'Location',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'asistente1',
      text: 'Asistente 1',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'asistente2',
      text: 'Asistente 2',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'estado',
      text: 'Estado',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    },{
      dataField: 'comentario',
      text: 'Comentario',
      headerStyle: {
        backgroundColor: '#8ec9ff'
      }
    }];

  const emptyDataMessage = () => { return 'Sin datos para mostrar';}

  if(listadoFinal[0].fecha !== undefined){
  var dia = new Date(listadoFinal[0].fecha)
  dia = dia.toLocaleDateString();
  
  }

  console.log(listadoFinal);

  useEffect(() => {

    var i = 0;
    var pendiente = 0;
    var noDisponible = 1;
    
    for(i=0; i<listadoFinal.length; i++){
      if(listadoFinal[i].finalizado==='Pendiente' || listadoFinal[i].finalizado==='No disponible'){
        setRestante(pendiente ++);
      }
      if(listadoFinal[i].finalizado==='No Disponible'){
        setNoPudo(noDisponible++);
      }
  
    }
     
    }, [listadoFinal])
    
  
    const rowStyle2 = (row, rowIndex) => {
      const style = {};
      // console.log(row);
      if (row.finalizado === 'Pendiente') {
        style.backgroundColor = 'rgb(188 188 188)';
      } else if (row.finalizado === 'Completa') {
        style.backgroundColor = '#3aa674';
      } else {
        style.backgroundColor = 'red'
      }
    
      return style;
    };
    
  console.log(listadoFinal);

 
  return (
  
  <div className='infoContainer'>

  <div className='range'>
    <h3>Deslice para seleccionar limite de dinero a extraer por máquina</h3>
      <Box sx={{ width: 500 }}>
        <Slider
          getAriaLabel={() => 'Temperature range'}
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
          min={0}
          max={100000}
          step={5000}
        />
      </Box>
    <h3>Limite de dinero seleccionado $ {value.toLocaleString('en-US')}</h3>
  </div>
    
      
      <div className='info'>
        <h3>Cantidad de maquinas a extraer {cant}</h3>
        <h3>Dinero total a extraer $ {totalFormat}</h3>
      </div>

      <Button className='but' variant="contained" color="success" onClick={handleClick} style={{'margin':'30px'}}>
        Confirmar configuración
      </Button>

      <div>
          <BootstrapTable
          keyField='maquina'
          data={ listadoFinal }
          columns={ columns }
          noDataIndication={ emptyDataMessage }
          rowStyle={ rowStyle2 }
        />
      </div>



    </div>
  );
}