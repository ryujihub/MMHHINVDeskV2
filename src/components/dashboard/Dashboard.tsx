import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  InventoryOutlined,
  TrendingUp,
  Warning,
  AttachMoney,
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalItems: number;
  lowStock: number;
  totalValue: number;
  monthlyTransactions: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
    monthlyTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const inventorySnapshot = await getDocs(collection(db, 'inventory'));
        let totalItems = 0;
        let lowStock = 0;
        let totalValue = 0;
        const lowStockItemsList: string[] = [];

        inventorySnapshot.forEach((doc) => {
          const item = doc.data();
          totalItems += 1;
          // Defensive: handle empty or invalid quantity string by treating as 0
          const currentStock = item.currentStock === "" || isNaN(Number(item.currentStock)) ? 0 : Number(item.currentStock);
          const minStock = Number(item.minQuantity);
          const price = Number(item.price);
          console.log(`Item: ${item.name}, Quantity: ${currentStock}, MinStock: ${minStock}`);
          // Adjusted: count as low stock if current stock is less than or equal to minimum stock
          if (currentStock <= minStock) {
            lowStock += 1;
            lowStockItemsList.push(item.name || 'Unnamed Item');
            console.log(`Low stock item added: ${item.name}`);
          }
          totalValue += currentStock * price;
        });
        console.log('Low stock items list:', lowStockItemsList);

        // Get monthly transactions count
        const monthStart = new Date();
        monthStart.setDate(1);
        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
        const monthlyTransactions = transactionsSnapshot.docs.filter(
          (doc) => doc.data().date.toDate() >= monthStart
        ).length;

        setStats({
          totalItems,
          lowStock,
          totalValue,
          monthlyTransactions,
        });
        setLowStockItems(lowStockItemsList);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { label: string; data: number[]; fill: boolean; borderColor: string; tension: number; }[] }>({
    labels: [],
    datasets: [
      {
        label: 'Monthly Sales',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  const [pieChartData, setPieChartData] = useState<{ labels: string[]; datasets: { data: number[]; backgroundColor: string[]; hoverOffset: number; }[] }>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF',
          '#8B0000',
          '#00FF00',
          '#00008B',
        ],
        hoverOffset: 4,
      },
    ],
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const salesSnapshot = await getDocs(collection(db, 'sales'));
        const sales: { [key: string]: number } = {};

        salesSnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.date.toDate();
          const month = date.toLocaleString('default', { month: 'short' });
          sales[month] = (sales[month] || 0) + data.total;
        });

        const labels = Object.keys(sales);
        const data = Object.values(sales);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Monthly Sales',
              data,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching sales data for dashboard:', error);
      }
    };

    const fetchCategoryData = async () => {
      try {
        const inventorySnapshot = await getDocs(collection(db, 'inventory'));
        const categoryCounts: { [key: string]: number } = {};

        inventorySnapshot.forEach((doc) => {
          const item = doc.data();
          const category = item.category || 'Uncategorized';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        setPieChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#C9CBCF',
                '#8B0000',
                '#00FF00',
                '#00008B',
              ],
              hoverOffset: 4,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching category data for dashboard:', error);
      }
    };

    fetchSalesData();
    fetchCategoryData();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryOutlined color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">Total Items</Typography>
              </Box>
              <Typography variant="h4">{stats.totalItems}</Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary">Low Stock Items</Typography>
              </Box>
              <Typography variant="h4">{stats.lowStock}</Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">Total Value</Typography>
              </Box>
              <Typography variant="h4">₱{stats.totalValue.toLocaleString()}</Typography>
            </CardContent>
          </Card>
          
          {/* Removed Monthly Transactions card as requested */}
        </Box>
        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
              {lowStockItems.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No low stock items.
                </Typography>
              ) : (
                lowStockItems.map((item, index) => (
                  <Typography key={index} variant="body2">
                    - {item}
                  </Typography>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};
