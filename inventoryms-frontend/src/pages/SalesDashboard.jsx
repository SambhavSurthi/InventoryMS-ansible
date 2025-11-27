import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesDashboard, fetchSalesAnalytics } from '../store/slices/dashboardSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  BarChart3,
  RefreshCw,
  Calendar,
  Download,
  Filter,
  Search,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Package,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

const SalesDashboard = () => {
  const dispatch = useDispatch();
  const { salesDashboard, salesAnalytics, isLoading, error } = useSelector((state) => state.dashboard);
  
  // Filter states
  const [timeRange, setTimeRange] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecentOrders, setShowRecentOrders] = useState(true);

  useEffect(() => {
    const period = timeRange === 'custom' ? null : timeRange;
    dispatch(fetchSalesDashboard({ period }));
    
    if (timeRange === 'custom' && startDate && endDate) {
      dispatch(fetchSalesAnalytics({ startDate, endDate }));
    } else {
      // Default analytics for current period
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (timeRange === '7' ? 7 : timeRange === '30' ? 30 : 90));
      dispatch(fetchSalesAnalytics({ 
        startDate: start.toISOString().split('T')[0], 
        endDate: end.toISOString().split('T')[0] 
      }));
    }
  }, [dispatch, timeRange, startDate, endDate]);

  const handleRefresh = () => {
    const period = timeRange === 'custom' ? null : timeRange;
    dispatch(fetchSalesDashboard({ period }));
    
    if (timeRange === 'custom' && startDate && endDate) {
      dispatch(fetchSalesAnalytics({ startDate, endDate }));
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (timeRange === '7' ? 7 : timeRange === '30' ? 30 : 90));
      dispatch(fetchSalesAnalytics({ 
        startDate: start.toISOString().split('T')[0], 
        endDate: end.toISOString().split('T')[0] 
      }));
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter recent orders
  const filteredRecentOrders = salesDashboard?.recentOrders?.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Prepare chart data from real API data
  const dailySalesData = salesDashboard?.dailySales?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    sales: day.sales,
    orders: 0, // This would need to be calculated from orders data
    revenue: day.sales
  })) || [];

  const paymentMethodData = salesDashboard?.salesByPaymentMethod ? 
    Object.entries(salesDashboard.salesByPaymentMethod).map(([method, count]) => ({
      name: method,
      value: count,
      color: method === 'Credit Card' ? '#3b82f6' : 
             method === 'Cash' ? '#10b981' : 
             method === 'Debit Card' ? '#8b5cf6' : '#f59e0b'
    })) : [];

  const orderStatusData = salesAnalytics?.salesByStatus ? 
    Object.entries(salesAnalytics.salesByStatus).map(([status, count]) => ({
      name: status,
      value: count,
      color: status === 'DELIVERED' ? '#10b981' : 
             status === 'PENDING' ? '#f59e0b' : 
             status === 'CANCELLED' ? '#ef4444' : '#6b7280'
    })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading sales dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Monitor your sales performance and revenue analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="timeRange">Time Range</Label>
                <select
                  id="timeRange"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {timeRange === 'custom' && (
                <>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTimeRange('7');
                    setStartDate('');
                    setEndDate('');
                    setSearchTerm('');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesDashboard?.totalSales || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  Period: {salesDashboard?.periodDays || 0} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(salesDashboard?.totalOrders || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  Pending: {formatNumber(salesDashboard?.pendingOrders || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesDashboard?.averageOrderValue || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  Per order
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesDashboard?.totalOrders > 0 
                    ? ((salesDashboard.totalOrders - (salesDashboard.pendingOrders || 0)) / salesDashboard.totalOrders * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">
                  Completed orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
            <CardDescription>Sales performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' || name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                    name === 'sales' ? 'Sales' : name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
            <CardDescription>Distribution of payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Analysis */}
      {orderStatusData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                Recent Orders ({filteredRecentOrders.length})
              </CardTitle>
              <CardDescription>Latest customer orders and transactions</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 max-w-xs">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecentOrders(!showRecentOrders)}
              >
                {showRecentOrders ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showRecentOrders ? (
            <div className="space-y-4">
              {filteredRecentOrders.length > 0 ? (
                filteredRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent orders found
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Recent orders are hidden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold">{formatCurrency(salesDashboard?.totalSales || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Orders Completed</span>
                <span className="font-semibold">
                  {formatNumber((salesDashboard?.totalOrders || 0) - (salesDashboard?.pendingOrders || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="font-semibold">{formatCurrency(salesDashboard?.averageOrderValue || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="font-semibold text-yellow-600">
                  {formatNumber(salesDashboard?.pendingOrders || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Period Information</CardTitle>
            <CardDescription>Analysis period details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Analysis Period</span>
                <span className="font-semibold">{salesDashboard?.periodDays || 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Date</span>
                <span className="font-semibold">
                  {salesDashboard?.startDate ? formatDate(salesDashboard.startDate) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">End Date</span>
                <span className="font-semibold">
                  {salesDashboard?.endDate ? formatDate(salesDashboard.endDate) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Average</span>
                <span className="font-semibold">
                  {formatCurrency(
                    salesDashboard?.totalSales && salesDashboard?.periodDays
                      ? salesDashboard.totalSales / salesDashboard.periodDays
                      : 0
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesDashboard;