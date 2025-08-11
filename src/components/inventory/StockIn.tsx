import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from '@mui/material';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface StockInProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    itemCode: string;
    quantity: number;
  } | null;
}

export const StockIn = ({ open, onClose, item }: StockInProps) => {
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    try {
      const quantityNum = parseInt(quantity);
      const costNum = parseFloat(unitCost);

      // Update inventory quantity
      const itemRef = doc(db, 'inventory', item.id);
      await updateDoc(itemRef, {
        quantity: increment(quantityNum),
        lastUpdated: serverTimestamp(),
      });

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        type: 'IN',
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.name,
        quantity: quantityNum,
        unitCost: costNum,
        total: quantityNum * costNum,
        supplier,
        referenceNumber,
        notes,
        date: serverTimestamp(),
      });

      // Create activity log
      await addDoc(collection(db, 'activityLogs'), {
        action: 'STOCK_IN',
        details: `Added ${quantityNum} units of ${item.name}`,
        timestamp: serverTimestamp(),
        itemId: item.id,
      });

      onClose();
      setQuantity('');
      setUnitCost('');
      setSupplier('');
      setReferenceNumber('');
      setNotes('');
    } catch (error) {
      console.error('Error processing stock in:', error);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Stock In - {item.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Current Stock: {item.quantity}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                inputProps={{ min: 1 }}
              />
              
              <TextField
                sx={{ flex: 1 }}
                label="Unit Cost"
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₱</InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={supplier}
                label="Supplier"
                onChange={(e) => setSupplier(e.target.value)}
                required
              >
                <MenuItem value="Supplier 1">Supplier 1</MenuItem>
                <MenuItem value="Supplier 2">Supplier 2</MenuItem>
                <MenuItem value="Supplier 3">Supplier 3</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
