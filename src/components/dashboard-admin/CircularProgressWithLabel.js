// src/components/dashboard-admin/CircularProgressWithLabel.js
import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const CircularProgressWithLabel = ({ value, color, size = 80, thickness = 8, label, icon }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={thickness}
          sx={{ color: theme.palette.grey[200] }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={size}
          thickness={thickness}
          sx={{
            color: color,
            position: 'absolute',
            left: 0,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon ? (
            React.cloneElement(icon, { style: { color, fontSize: size * 0.4 } })
          ) : (
            <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: size * 0.25 }}>
              {`${Math.round(value)}%`}
            </Typography>
          )}
        </Box>
      </Box>
      {label && (
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default CircularProgressWithLabel;