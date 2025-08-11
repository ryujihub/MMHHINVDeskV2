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
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const inventorySnapshot = await getDocs(collection(db, 'inventory'));
        let totalItems = 0;
        let lowStock = 0;
        let totalValue = 0;

        inventorySnapshot.forEach((doc) => {
          const item = doc.data();
          totalItems += 1;
          if (item.quantity <= item.minQuantity) {
            lowStock += 1;
          }
          totalValue += item.quantity * item.price;
        });

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
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Sales',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
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
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="info" sx={{ mr: 1 }} />
              <Typography color="textSecondary">Monthly Transactions</Typography>
            </Box>
            <Typography variant="h4">{stats.monthlyTransactions}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sales Overview
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
