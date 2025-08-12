import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { 
  collection, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { EditInventoryDialog } from './EditInventoryDialog';

import { InventoryItem as IInventoryItem } from '../../schema';

type InventoryItem = IInventoryItem;

export const InventoryTable = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryData: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        inventoryData.push({
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as InventoryItem);
      });
      setItems(inventoryData);
      setFilteredItems(inventoryData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setShowEditDialog(true);
  };

  const handleSave = async (updatedItem: Partial<InventoryItem>) => {
    try {
      if (editItem?.id) {
        // Update existing item
        await updateDoc(doc(db, 'inventory', editItem.id), {
          ...updatedItem,
          lastUpdated: serverTimestamp(),
        });
        setSnackbar({ message: 'Item updated successfully', severity: 'success' });
      } else {
        // Add new item logic here
        // You'll need to implement addDoc for new items
      }
    } catch (error) {
      setSnackbar({ 
        message: `Error: ${error instanceof Error ? error.message : 'An error occurred'}`, 
        severity: 'error' 
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
        setSnackbar({ message: 'Item deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ 
          message: `Error deleting item: ${error instanceof Error ? error.message : 'An error occurred'}`, 
          severity: 'error' 
        });
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Inventory Items
        </Typography>
        <Button variant="contained" color="primary">
          Add New Item
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name, code, or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Min. Stock</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productCode}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.name}
                    {item.currentStock <= item.minQuantity && (
                      <Tooltip title={`Low Stock Alert: Only ${item.currentStock} units left out of minimum ${item.minQuantity}`}>
                        <Chip
                          icon={<WarningIcon fontSize="small" />}
                          label={`Low Stock: ${item.currentStock}/${item.minQuantity}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={item.category} size="small" />
                </TableCell>
                <TableCell align="right">{item.currentStock}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    {item.minQuantity}
                    {item.currentStock <= item.minQuantity && (
                      <Tooltip title={`Low Stock Alert: ${item.currentStock} units remaining`}>
                        <WarningIcon color="error" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">₱{item.price.toLocaleString()}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={() => handleEdit(item)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => item.id && handleDelete(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditInventoryDialog
        open={showEditDialog}
        item={editItem}
        onClose={() => {
          setShowEditDialog(false);
          setEditItem(null);
        }}
        onSave={handleSave}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
      >
        <Alert 
          onClose={() => setSnackbar(null)} 
          severity={snackbar?.severity || 'success'} 
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
