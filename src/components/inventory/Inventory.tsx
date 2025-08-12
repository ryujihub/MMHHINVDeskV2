import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { InventoryTable } from './InventoryTable';
import { useNavigate } from 'react-router-dom';

export const Inventory = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      
        <Box sx={{ display: 'flex', gap: 2 }}>
          
        </Box>
      </Box>
      <InventoryTable />
    </Box>
  );
};
