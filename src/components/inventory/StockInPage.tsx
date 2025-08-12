import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const StockInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    quantity: '',
    unitCost: '',
    supplier: '',
    referenceNumber: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'transactions'), {
        type: 'IN',
        ...formData,
        quantity: parseInt(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        total: parseInt(formData.quantity) * parseFloat(formData.unitCost),
        date: serverTimestamp(),
      });

      // Reset form
      setFormData({
        itemName: '',
        itemCode: '',
        quantity: '',
        unitCost: '',
        supplier: '',
        referenceNumber: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error processing stock in:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/inventory')} 
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Stock In Management
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <Box>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                required
              />
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Item Code"
                value={formData.itemCode}
                onChange={(e) => handleChange('itemCode', e.target.value)}
                required
              />
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
                inputProps={{ min: 1 }}
              />
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Unit Cost"
                type="number"
                value={formData.unitCost}
                onChange={(e) => handleChange('unitCost', e.target.value)}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  required
                >
                  <MenuItem value="Supplier 1">Supplier 1</MenuItem>
                  <MenuItem value="Supplier 2">Supplier 2</MenuItem>
                  <MenuItem value="Supplier 3">Supplier 3</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Reference Number"
                value={formData.referenceNumber}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                required
              />
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Button type="submit" variant="contained" color="primary">
                Add Stock
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
