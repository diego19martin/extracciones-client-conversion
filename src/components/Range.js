import {useState} from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { postConfig, postMaquinas } from '../api/conversion.api';
import BootstrapTable from 'react-bootstrap-table-next';


function valuetext(value) {
  return `${value}°C`;
}


export default function Range(items) {

  var extraer = 0;
  var sumTotal = 0;

  const [value, setValue] = useState(10000);
  const [Resumen, setResumen] = useState([0]);
  const [cant, SetCant] = useState(0);
  const [Total, SetTotal] = useState(0)
  const [listadoFinal, setListadoFinal] = useState([0])

  const handleChange = (event, newValue) => {

    setResumen(items)

    setValue(newValue);

    // console.log(newValue);
   
    var i = 0;
    var listadoExtraer = [];

    // console.log(Resumen.prop s);

    for (i=0; i<Resumen.props.length; i++) {
      if (Resumen.props[i].bill > value) {
        console.log(Resumen.props[i].bill);
        extraer ++
        sumTotal = sumTotal + Resumen.props[i].bill
        listadoExtraer.push(
          {
            'maquina' : Resumen.props[i].machine,
            'location' : Resumen.props[i].location,
            'bill' : Resumen.props[i].bill
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
    // console.log(value[0]);
    postConfig(value);
    postMaquinas(listadoFinal);
  }

  const columns = [{
    dataField: 'maquina',
    text: 'Máquina'
    },
    {
      dataField: 'location',
      text: 'Location'
    },{
      dataField: 'asistentes',
      text: 'Asistentes'
    },{
      dataField: 'finalizada',
      text: 'Finalizada'
    }];

    const emptyDataMessage = () => { return 'No Data to Display';}

  return (
    <div>

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

      <div className='divBotones'>
    
      </div>

      <div>
        <h3>Limite de dinero seleccionado {value}</h3>
        <h1>Cantidad de maquinas a extraer {cant}</h1>
        <h1>Dinero total a extraer $ {Total}</h1>
      </div>

      <Button className='but' variant="contained" color="success" onClick={handleClick} style={{'margin':'30px'}}>
        Confirmar configuración
      </Button>

      <BootstrapTable 

        keyField='maquina'
        data={ listadoFinal }
        columns={ columns }
        noDataIndication={ emptyDataMessage }
      
      />

    </div>
  );
}