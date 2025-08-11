// Database Schema Design
import { Timestamp } from 'firebase/firestore';

export interface InventoryItem {
  id?: string;
  productCode: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  minQuantity: number;
  price: number;
  costPrice: number;
  supplier: string;
  location: string;
  lastUpdated: Timestamp;
  createdAt: Timestamp;
}

export interface Category {
  id?: string;
  name: string;
  description: string;
  createdAt: Timestamp;
}

export interface Supplier {
  id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Timestamp;
}

export interface Transaction {
  id?: string;
  type: 'IN' | 'OUT';
  itemId: string;
  quantity: number;
  price: number;
  total: number;
  date: Timestamp;
  referenceNumber: string;
  notes: string;
  createdBy: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  action: 'STOCK_IN' | 'STOCK_OUT' | 'UPDATE' | 'LOGIN' | 'LOGOUT';
  details: string;
  timestamp: Timestamp;
  itemId?: string;
}

// Report Types
export interface SalesSummary {
  totalRevenue: number;
  totalItems: number;
  averageDaily: number;
  dailySales: { [date: string]: number };
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categoryBreakdown: { [category: string]: number };
  lowStockItems: Array<{
    name: string;
    quantity: number;
    minQuantity: number;
  }>;
}
