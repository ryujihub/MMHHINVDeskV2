import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDistance } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  userId?: string;
  itemId?: string;
}

const actionColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  STOCK_IN: 'success',
  STOCK_OUT: 'error',
  UPDATE: 'warning',
  LOGIN: 'info',
  LOGOUT: 'info',
};

export const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      const q = query(
        collection(db, 'activityLogs'),
        orderBy('timestamp', 'desc'),
        limit(rowsPerPage)
      );
      
      const snapshot = await getDocs(q);
      const logsData: ActivityLog[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        logsData.push({
          id: doc.id,
          action: data.action,
          details: data.details,
          timestamp: data.timestamp.toDate(),
          userId: data.userId,
          itemId: data.itemId,
        });
      });
      
      setLogs(logsData);
      
      // Get total count
      const totalSnapshot = await getDocs(collection(db, 'activityLogs'));
      setTotal(totalSnapshot.size);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Activity Logs
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={actionColors[log.action] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>
                    {formatDistance(log.timestamp, new Date(), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};