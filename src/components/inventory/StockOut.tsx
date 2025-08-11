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
  InputAdornment,
  Typography,
  Alert,
} from '@mui/material';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface StockOutProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    itemCode: string;
    quantity: number;
    price: number;
  } | null;
}

export const StockOut = ({ open, onClose, item }: StockOutProps) => {
  const [quantity, setQuantity] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const quantityNum = parseInt(quantity);

    // Validate quantity
    if (quantityNum > item.quantity) {
      setError('Insufficient stock');
      return;
    }

    try {
      // Update inventory quantity
      const itemRef = doc(db, 'inventory', item.id);
      await updateDoc(itemRef, {
        quantity: increment(-quantityNum),
        lastUpdated: serverTimestamp(),
      });

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        type: 'OUT',
        itemId: item.id,
        itemCode: item.itemCode,
        itemName: item.name,
        quantity: quantityNum,
        price: item.price,
        total: quantityNum * item.price,
        referenceNumber,
        notes,
        date: serverTimestamp(),
      });

      // Create activity log
      await addDoc(collection(db, 'activityLogs'), {
        action: 'STOCK_OUT',
        details: `Removed ${quantityNum} units of ${item.name}`,
        timestamp: serverTimestamp(),
        itemId: item.id,
      });

      onClose();
      setQuantity('');
      setReferenceNumber('');
      setNotes('');
      setError('');
    } catch (error) {
      console.error('Error processing stock out:', error);
      setError('Failed to process stock out');
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Stock Out - {item.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Available Stock: {item.quantity}
            </Typography>

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              required
              inputProps={{ min: 1, max: item.quantity }}
              error={parseInt(quantity) > item.quantity}
              helperText={
                parseInt(quantity) > item.quantity
                  ? 'Quantity exceeds available stock'
                  : ''
              }
            />

            <TextField
              fullWidth
              label="Total Amount"
              type="number"
              value={quantity ? (parseInt(quantity) * item.price).toFixed(2) : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₱</InputAdornment>
                ),
                readOnly: true,
              }}
            />

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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!quantity || parseInt(quantity) > item.quantity}
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
