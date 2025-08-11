import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Line, Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth(new Date()));
  const [salesData, setSalesData] = useState<any>({});
  const [inventoryData, setInventoryData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchSalesReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'transactions'),
        where('type', '==', 'OUT'),
        where('date', '>=', Timestamp.fromDate(startOfDay(startDate))),
        where('date', '<=', Timestamp.fromDate(endOfDay(endDate)))
      );

      const snapshot = await getDocs(q);
      const sales: { [key: string]: number } = {};
      let totalRevenue = 0;
      let totalItems = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = format(data.date.toDate(), 'yyyy-MM-dd');
        sales[date] = (sales[date] || 0) + data.total;
        totalRevenue += data.total;
        totalItems += data.quantity;
      });

      setSalesData({
        chartData: {
          labels: Object.keys(sales).sort(),
          datasets: [
            {
              label: 'Daily Sales',
              data: Object.values(sales),
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
        summary: {
          totalRevenue,
          totalItems,
          averageDaily: totalRevenue / Object.keys(sales).length || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
    setLoading(false);
  };

  const fetchInventoryReport = async () => {
    try {
      const q = query(collection(db, 'inventory'));
      const snapshot = await getDocs(q);
      
      const categories: { [key: string]: number } = {};
      const lowStock: any[] = [];
      let totalValue = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        categories[data.category] = (categories[data.category] || 0) + 1;
        totalValue += data.quantity * data.price;

        if (data.quantity <= data.minQuantity) {
          lowStock.push({
            name: data.name,
            quantity: data.quantity,
            minQuantity: data.minQuantity,
          });
        }
      });

      setInventoryData({
        chartData: {
          labels: Object.keys(categories),
          datasets: [
            {
              label: 'Items by Category',
              data: Object.values(categories),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
              ],
            },
          ],
        },
        summary: {
          totalItems: snapshot.size,
          totalValue,
          lowStockCount: lowStock.length,
          lowStockItems: lowStock,
        },
      });
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchSalesReport();
    } else {
      fetchInventoryReport();
    }
  }, [tabValue, startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Reports
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="report tabs"
          >
            <Tab label="Sales Report" />
            <Tab label="Inventory Report" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
              <Button
                variant="contained"
                onClick={fetchSalesReport}
                disabled={loading}
              >
                Generate Report
              </Button>
            </Box>

            {salesData.chartData && (
              <>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4">
                          ₱{salesData.summary.totalRevenue.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Items Sold
                        </Typography>
                        <Typography variant="h4">
                          {salesData.summary.totalItems}
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Average Daily Sales
                        </Typography>
                        <Typography variant="h4">
                          ₱{salesData.summary.averageDaily.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Sales Trend
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={salesData.chartData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </Box>
                </Paper>
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {inventoryData.chartData && (
              <>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Items
                        </Typography>
                        <Typography variant="h4">
                          {inventoryData.summary.totalItems}
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Value
                        </Typography>
                        <Typography variant="h4">
                          ₱{inventoryData.summary.totalValue.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Low Stock Items
                        </Typography>
                        <Typography variant="h4" color="error">
                          {inventoryData.summary.lowStockCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Items by Category
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar
                      data={inventoryData.chartData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </Box>
                </Paper>

                {inventoryData.summary.lowStockItems.length > 0 && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Low Stock Items
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {inventoryData.summary.lowStockItems.map((item: any, index: number) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #eee',
                          }}
                        >
                          <Typography>{item.name}</Typography>
                          <Typography color="error">
                            {item.quantity}/{item.minQuantity}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}
              </>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};
