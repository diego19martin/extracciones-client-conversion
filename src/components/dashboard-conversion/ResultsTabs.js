import React from 'react';
import { Tabs, Tab } from '@mui/material';

const ResultsTabs = ({ activeTab, handleTabChange, summary, totalResults }) => {
  return (
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      variant="fullWidth"
      sx={{ mb: 2 }}
    >
      <Tab label={`Todos (${totalResults})`} />
      <Tab label={`Discrepancias (${summary.nonMatchingMachines})`} />
      <Tab label={`Faltantes (${summary.missingMachines})`} />
      <Tab label={`Extra (${summary.extraMachines})`} />
    </Tabs>
  );
};

export default ResultsTabs;