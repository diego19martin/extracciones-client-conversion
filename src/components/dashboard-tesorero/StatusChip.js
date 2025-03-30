// components/StatusChip.js
import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status }) => {
  let color = 'default';
  
  switch (status) {
    case 'Completa':
      color = 'success';
      break;
    case 'Pendiente':
      color = 'warning';
      break;
    case 'MATCH':
      color = 'success';
      break;
    case 'DISCREPANCY':
      color = 'error';
      break;
    case 'UNKNOWN':
      color = 'default';
      break;
    default:
      color = 'default';
  }
  
  return <Chip size="small" color={color} label={status} />;
};

export default StatusChip;