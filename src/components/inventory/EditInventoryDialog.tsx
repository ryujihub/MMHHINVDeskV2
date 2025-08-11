import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { InventoryItem } from '../../schema';

// Define type for the form data
type FormInventoryItem = Omit<InventoryItem, 'createdAt' | 'lastUpdated'> & {
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
};

interface EditInventoryDialogProps {
  open: boolean;
  item: FormInventoryItem | null;
  onClose: () => void;
  onSave: (updatedItem: Partial<FormInventoryItem>) => Promise<void>;
}

export const EditInventoryDialog = ({ open, item, onClose, onSave }: EditInventoryDialogProps) => {
  const [formData, setFormData] = useState<Partial<FormInventoryItem>>(item || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add useEffect to update formData when item changes
  useEffect(() => {
    setFormData(item || {});
  }, [item]);

  const handleChange = (field: keyof InventoryItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Product Code"
                value={formData.productCode || ''}
                onChange={(e) => handleChange('productCode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category || ''}
                  label="Category"
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  <MenuItem value="Paint">Paint</MenuItem>
                  <MenuItem value="Tools">Tools</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                  <MenuItem value="Plumbing">Plumbing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Current Stock"
                value={formData.currentStock || ''}
                onChange={(e) => handleChange('currentStock', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Stock Level"
                value={formData.minQuantity || ''}
                onChange={(e) => handleChange('minQuantity', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
