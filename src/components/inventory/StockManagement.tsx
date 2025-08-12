import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, query, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface Product {
  id: string;
  name: string;
  productCode: string;
  currentStock: number;
}

interface Transaction {
  id: string;
  type: 'IN' | 'OUT';
  itemName: string;
  itemCode: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  date: Date;
}

export const StockManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [type, setType] = useState('in');

  useEffect(() => {
    // Load inventory data
    const inventoryUnsubscribe = onSnapshot(query(collection(db, 'inventory')), (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
    });

    // Load recent transactions
    const transactionsUnsubscribe = onSnapshot(
      query(
        collection(db, 'transactions'),
        orderBy('date', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        const transactionsData: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.date) { // Make sure date exists
            transactionsData.push({
              id: doc.id,
              type: data.type,
              itemName: data.itemName,
              itemCode: data.itemCode,
              quantity: data.quantity,
              previousStock: data.previousStock || 0,
              newStock: data.newStock || 0,
              date: data.date.toDate(),
            });
          }
        });
        setTransactions(transactionsData);
      }
    );

    return () => {
      inventoryUnsubscribe();
      transactionsUnsubscribe();
    };
  }, []);

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    // The products list will be filtered in the Select component's display
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !quantity) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    try {
      // Update inventory quantity
      const quantityNum = parseInt(quantity);
      
      // Check if there's enough stock for stock out
      if (type === 'out' && product.currentStock < quantityNum) {
        alert('Insufficient stock');
        return;
      }

      const newStock = type === 'in' ? 
        product.currentStock + quantityNum : 
        product.currentStock - quantityNum;

      // First update the inventory document
      await updateDoc(doc(db, 'inventory', selectedProduct), {
        currentStock: newStock,
        lastUpdated: serverTimestamp(),
      });

      // Then add the transaction record
      await addDoc(collection(db, 'transactions'), {
        type: type.toUpperCase(),
        itemId: selectedProduct,
        itemName: product.name,
        itemCode: product.productCode,
        quantity: quantityNum,
        previousStock: product.currentStock,
        newStock: newStock,
        date: serverTimestamp(),
      });

      // Reset form
      setQuantity('1');
      setSelectedProduct('');
      setType('in');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to delete this stock update?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete the stock update.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Stock In / Out
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, product code, or QR/barcode"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              displayEmpty
              renderValue={selectedProduct ? undefined : () => "Select Product"}
            >
              <MenuItem value="" disabled>Select Product</MenuItem>
              {products
                .filter(product => 
                  searchTerm ? 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
                  : true
                )
                .map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} (Code: {product.productCode}) (Current Stock: {product.currentStock})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <RadioGroup
            row
            value={type}
            onChange={(e) => setType(e.target.value)}
            sx={{ justifyContent: 'center' }}
          >
            <FormControlLabel value="in" control={<Radio />} label="Stock In" />
            <FormControlLabel value="out" control={<Radio />} label="Stock Out" />
          </RadioGroup>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleUpdateStock}
            disabled={!selectedProduct || !quantity}
          >
            Update Stock
          </Button>
        </Box>
      </Paper>

      {/* Recent Transactions Log */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Stock Updates
        </Typography>
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Previous Stock</TableCell>
                <TableCell>New Stock</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                  <TableCell>{transaction.itemName}</TableCell>
                  <TableCell>{transaction.itemCode}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.type === 'OUT' ? `-${transaction.quantity}` : `+${transaction.quantity}`}</TableCell>
                  <TableCell>{transaction.previousStock}</TableCell>
                  <TableCell>{transaction.newStock}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No recent updates</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}