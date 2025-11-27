import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

// Async thunks
export const fetchInventoryDashboard = createAsyncThunk(
  'dashboard/fetchInventoryDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getInventoryDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory dashboard');
    }
  }
);

export const fetchSalesDashboard = createAsyncThunk(
  'dashboard/fetchSalesDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getSalesDashboard(params.period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales dashboard');
    }
  }
);

export const fetchSalesAnalytics = createAsyncThunk(
  'dashboard/fetchSalesAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getSalesAnalytics(params.startDate, params.endDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales analytics');
    }
  }
);

export const fetchLowStockAlerts = createAsyncThunk(
  'dashboard/fetchLowStockAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getLowStockAlerts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock alerts');
    }
  }
);

const initialState = {
  inventoryDashboard: null,
  salesDashboard: null,
  salesAnalytics: null,
  lowStockAlerts: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboards: (state) => {
      state.inventoryDashboard = null;
      state.salesDashboard = null;
      state.salesAnalytics = null;
      state.lowStockAlerts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryDashboard = action.payload;
      })
      .addCase(fetchInventoryDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSalesDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesDashboard = action.payload;
      })
      .addCase(fetchSalesDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesAnalytics = action.payload;
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLowStockAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockAlerts = action.payload;
      })
      .addCase(fetchLowStockAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboards } = dashboardSlice.actions;
export default dashboardSlice.reducer;
