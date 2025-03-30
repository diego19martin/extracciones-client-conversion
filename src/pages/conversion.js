import React, { useState, useEffect } from 'react';
import { Box, Paper, Button, Alert, CircularProgress, Typography, useMediaQuery, useTheme, Grid, Divider } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Header } from '../components/Header';
import { getListadoFiltrado } from '../api/conversion.api';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx'; // Importación necesaria para evitar el error de eslint

// Import our components
import DatabaseInfoPanel from '../components/dashboard-conversion/DatabaseInfoPanel';
import FileUploadSection from '../components/dashboard-conversion/FileUploadSection';
import SummaryCards from '../components/dashboard-conversion/SummaryCards';
import ResultsTabs from '../components/dashboard-conversion/ResultsTabs';
import ResultsTable from '../components/dashboard-conversion/ResultsTable';
import MachineDetailsModal from '../components/dashboard-conversion/MachineDetailsModal';
import ConfirmZoneButton from '../components/dashboard-conversion/ConfirmZoneButton';

// Import utility functions
import { processDatFileLocally, processXlsFileLocally, compareDataLocally } from '../utils/dataProcessing';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // States for files and data
  const [datFile, setDatFile] = useState(null);
  const [xlsFile, setXlsFile] = useState(null);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [extractionData, setExtractionData] = useState({});
  const [summary, setSummary] = useState({
    totalExpected: 0,
    totalCounted: 0,
    matchingMachines: 0,
    nonMatchingMachines: 0,
    missingMachines: 0,
    extraMachines: 0
  });

  // For processing state
  const [datProcessed, setDatProcessed] = useState(false);
  const [xlsProcessed, setXlsProcessed] = useState(false);

  // Record count states
  const [datCount, setDatCount] = useState(0);
  const [xlsCount, setXlsCount] = useState(0);

  // State for filtered database list
  const [listaFiltrada, setListaFiltrada] = useState([]);
  const [loadingListado, setLoadingListado] = useState(true);
  
  // Estado para el modal de detalles de máquina
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Load filtered data on component mount
  useEffect(() => {
    const fetchListadoFiltrado = async () => {
      try {
        setLoadingListado(true);
        const response = await getListadoFiltrado();

        // Extract the data array from the response
        const data = Array.isArray(response) ? response :
          (response && response.data ? response.data : []);

        if (Array.isArray(data)) {
          // Create a map for faster access by machine number
          const listadoMap = {};
          data.forEach(item => {
            listadoMap[item.maquina] = item;
          });

          setListaFiltrada(data);
          setExtractionData(listadoMap);
          console.log(`Cargados ${data.length} registros de listado_filtrado`);
        } else {
          console.error('Los datos recibidos no son un array:', response);
          setListaFiltrada([]);
          setExtractionData({});
          setError('Formato de datos incorrecto desde el servidor');
        }
      } catch (error) {
        console.error('Error al cargar listado_filtrado:', error);
        setError('No se pudo cargar la información de máquinas desde la base de datos.');
      } finally {
        setLoadingListado(false);
      }
    };

    fetchListadoFiltrado();
  }, []);

  // Handle DAT file selection
  const handleDatFileSelect = async (file) => {
    if (file) {
      setDatFile(file);
      setDatProcessed(false);

      try {
        const content = await file.text();
        const lines = content.split('\n');
        const dataLines = lines.filter(line => line.startsWith('D;'));
        setDatCount(dataLines.length);
        setDatProcessed(true);
      } catch (error) {
        console.error('Error al procesar el archivo DAT:', error);
        setDatCount(0);
        setDatProcessed(false);
        setError('Error al procesar el archivo DAT');
      }
    }
  };

  // Handle XLS file selection
  const handleXlsFileSelect = (file) => {
    if (file) {
      setXlsFile(file);
      setXlsProcessed(false);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setXlsCount(jsonData.length);
          setXlsProcessed(true);
        } catch (error) {
          console.error('Error al procesar el archivo Excel:', error);
          setXlsCount(0);
          setXlsProcessed(false);
          setError('Error al procesar el archivo Excel');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Main reconciliation function
  const handleConciliarConteo = async () => {
    if (!datFile || !xlsFile) {
      setError('Debe seleccionar ambos archivos para realizar la conciliación.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Process files using utility functions - Now pass dbMachines to processDatFileLocally
      const datData = await processDatFileLocally(datFile, extractionData);
      const xlsData = await processXlsFileLocally(xlsFile);

      // Verify processing was successful
      if (!datData || !xlsData) {
        throw new Error('Error procesando los archivos. Verifique el formato.');
      }

      console.log(`Procesados: ${datData.length} registros DAT, ${xlsData.length} registros XLS`);

      // Look for any missing machine mappings
      const missingMappings = datData
        .filter(item => !item.machineId || item.machineId === item.internalDatId)
        .map(item => ({
          headercard: item.headercard,
          internalDatId: item.internalDatId
        }));

      if (missingMappings.length > 0) {
        console.warn(`Se encontraron ${missingMappings.length} máquinas sin mapeo en la base de datos:`, missingMappings);
      }

      // Perform local reconciliation with preloaded data
      const results = compareDataLocally(datData, xlsData, extractionData);

      // Update state with results
      setComparisonResults(results.results);
      setSummary(results.summary);

      // Success message
      Swal.fire({
        icon: 'success',
        title: 'Conciliación completada',
        text: `Se procesaron ${results.results.length} máquinas con éxito`,
        timer: 3000
      });
    } catch (error) {
      console.error('Error durante la conciliación:', error);
      setError(`Error: ${error.message}. Verifique el formato de los archivos.`);

      Swal.fire({
        icon: 'error',
        title: 'Error en la conciliación',
        text: `Ocurrió un problema: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle showing machine details
  const handleShowMachineDetails = (machine) => {
    setSelectedMachine(machine);
    setModalOpen(true);
  };
  
  // Handle closing machine details modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Handle successful confirmation
  const handleConfirmationSuccess = (data) => {
    console.log('Conciliación confirmada:', data);
    // Podríamos implementar acciones adicionales aquí, como:
    // - Redirigir a otra página
    // - Limpiar el formulario
    // - Mostrar un resumen detallado
  };

  return (
    <>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Conversión
        </Typography>

        {/* Database Information Panel */}
        <DatabaseInfoPanel 
          listaFiltrada={listaFiltrada} 
          loadingListado={loadingListado} 
        />

        {/* File Upload Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Carga de Archivos
          </Typography>
          
          <FileUploadSection 
            datFile={datFile}
            xlsFile={xlsFile}
            datProcessed={datProcessed}
            xlsProcessed={xlsProcessed}
            datCount={datCount}
            xlsCount={xlsCount}
            onDatFileSelect={handleDatFileSelect}
            onXlsFileSelect={handleXlsFileSelect}
          />

          {/* Reconciliation Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleConciliarConteo}
              disabled={loading || !datFile || !xlsFile || loadingListado}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CompareArrowsIcon />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'PROCESANDO...' : 'CONCILIAR CONTEO DE ZONA'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {comparisonResults.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Resultados de la Conciliación
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  // We'll implement this in the utility functions
                  alert('Exportar a Excel - Funcionalidad a implementar');
                }}
                disabled={loading}
              >
                Exportar a Excel
              </Button>
            </Box>

            {/* Summary Cards */}
            <SummaryCards summary={summary} />

            {/* Results Tabs */}
            <ResultsTabs 
              activeTab={activeTab} 
              handleTabChange={handleTabChange}
              summary={summary}
              totalResults={comparisonResults.length}
            />

            {/* Results Table */}
            <ResultsTable 
              comparisonResults={comparisonResults}
              activeTab={activeTab} 
              onRowClick={handleShowMachineDetails}
              isMobile={isMobile}
            />
            
            {/* Confirmation Button */}
            {comparisonResults.length > 0 && (
              <Box sx={{ mt: 4, mb: 2 }}>
                <Divider sx={{ mb: 4 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Confirmar Resultados de Conciliación
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
                  Si está satisfecho con los resultados de la conciliación, presione el botón para confirmar
                  y guardar los resultados en el sistema.
                </Typography>
                
                <Box sx={{ maxWidth: '500px', mx: 'auto' }}>
                  <ConfirmZoneButton
                    summary={summary}
                    results={comparisonResults}
                    datFile={datFile}
                    xlsFile={xlsFile}
                    onSuccess={handleConfirmationSuccess}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Machine Details Modal */}
      <MachineDetailsModal
        machine={selectedMachine}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Dashboard;