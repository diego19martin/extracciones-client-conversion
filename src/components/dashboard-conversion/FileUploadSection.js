import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const FileUploadSection = ({
  datFile,
  xlsFile,
  datProcessed,
  xlsProcessed,
  datCount,
  xlsCount,
  onDatFileSelect,
  onXlsFileSelect
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Archivo .dat de Contadora
            </Typography>
            <input
              type="file"
              accept=".dat"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  onDatFileSelect(file);
                }
              }}
              style={{ display: 'none' }}
              id="dat-file-input"
            />
            <label htmlFor="dat-file-input">
              <Button
                variant="contained"
                component="span"
                fullWidth
                color={datFile ? "success" : "primary"}
                startIcon={datFile ? <CheckCircleIcon /> : <FileUploadIcon />}
              >
                {datFile
                  ? `${datFile.name.length > 30
                    ? datFile.name.substring(0, 27) + '...'
                    : datFile.name}`
                  : "Seleccionar archivo .dat"}
              </Button>
            </label>
            {datFile && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {datProcessed ? `${datCount} máquinas detectadas` : 'Procesando archivo...'}
                </Typography>
                <LinearProgress
                  variant={datProcessed ? "determinate" : "indeterminate"}
                  value={datProcessed ? 100 : 0}
                  color="success"
                  sx={{ mt: 1, height: 6, borderRadius: 1 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Archivo Excel de Reporte
            </Typography>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  onXlsFileSelect(file);
                }
              }}
              style={{ display: 'none' }}
              id="xls-file-input"
            />
            <label htmlFor="xls-file-input">
              <Button
                variant="contained"
                component="span"
                fullWidth
                color={xlsFile ? "success" : "primary"}
                startIcon={xlsFile ? <CheckCircleIcon /> : <FileUploadIcon />}
              >
                {xlsFile
                  ? `${xlsFile.name.length > 30
                    ? xlsFile.name.substring(0, 27) + '...'
                    : xlsFile.name}`
                  : "Seleccionar archivo Excel"}
              </Button>
            </label>
            {xlsFile && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {xlsProcessed ? `${xlsCount} registros detectados` : 'Procesando archivo...'}
                </Typography>
                <LinearProgress
                  variant={xlsProcessed ? "determinate" : "indeterminate"}
                  value={xlsProcessed ? 100 : 0}
                  color="success"
                  sx={{ mt: 1, height: 6, borderRadius: 1 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default FileUploadSection;