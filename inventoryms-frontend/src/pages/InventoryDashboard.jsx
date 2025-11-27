import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventoryDashboard, fetchLowStockAlerts } from '../store/slices/dashboardSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Search,
  X,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Clock,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

const InventoryDashboard = () => {
  const dispatch = useDispatch();
  const { inventoryDashboard, lowStockAlerts, isLoading, error } = useSelector((state) => state.dashboard);
  
  // Filter states
  const [showLowStock, setShowLowStock] = useState(true);
  const [showOverstock, setShowOverstock] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchInventoryDashboard());
    dispatch(fetchLowStockAlerts());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchInventoryDashboard());
    dispatch(fetchLowStockAlerts());
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  // Filter products based on search and category
  const filteredLowStockProducts = lowStockAlerts?.lowStockProducts?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const filteredOutOfStockProducts = lowStockAlerts?.outOfStockProducts?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Prepare chart data from real API data
  const stockStatusData = inventoryDashboard ? [
    { name: 'In Stock', value: inventoryDashboard.activeProducts - inventoryDashboard.lowStockCount - inventoryDashboard.outOfStockCount, color: '#10b981' },
    { name: 'Low Stock', value: inventoryDashboard.lowStockCount, color: '#f59e0b' },
    { name: 'Out of Stock', value: inventoryDashboard.outOfStockCount, color: '#ef4444' }
  ] : [];

  const topSellingData = inventoryDashboard?.topSellingProducts?.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    stock: product.stockQuantity,
    price: product.price,
    value: product.stockQuantity * product.price
  })) || [];

  const recentlyAddedData = inventoryDashboard?.recentlyAddedProducts?.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    stock: product.stockQuantity,
    price: product.price,
    cost: product.costPrice,
    margin: product.price - product.costPrice
  })) || [];

  // Prepare data for Stock vs Price Analysis - create stacked area chart data
  const stockPriceAnalysisData = [
    ...(inventoryDashboard?.topSellingProducts?.map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      stock: product.stockQuantity || 0,
      price: product.price || 0,
      sku: product.sku,
      fullName: product.name
    })) || []),
    ...(inventoryDashboard?.recentlyAddedProducts?.map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      stock: product.stockQuantity || 0,
      price: product.price || 0,
      sku: product.sku,
      fullName: product.name
    })) || [])
  ].filter(item => item.stock > 0 && item.price > 0); // Filter out invalid data

  // Debug: Log the data to console
  console.log('Stock Price Analysis Data:', stockPriceAnalysisData);

  // Chart configuration for stacked area chart
  const chartConfig = {
    stock: {
      label: "Stock Quantity",
      color: "hsl(var(--chart-1))",
    },
    price: {
      label: "Price (₹)",
      color: "hsl(var(--chart-2))",
    },
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading inventory dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600">Monitor your inventory performance and stock levels</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Products</Label>
                <Input
                  id="search"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateRange">Time Range</Label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    // setSelectedCategory('');
                    setDateRange('30d');
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(inventoryDashboard?.totalProducts || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(inventoryDashboard?.activeProducts || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(inventoryDashboard?.lowStockCount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(inventoryDashboard?.outOfStockCount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(inventoryDashboard?.totalInventoryValue || 0)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Average per product</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  inventoryDashboard?.totalInventoryValue && inventoryDashboard?.totalProducts
                    ? inventoryDashboard.totalInventoryValue / inventoryDashboard.totalProducts
                    : 0
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
            <CardDescription>Current inventory status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with highest stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? formatCurrency(value) : formatNumber(value),
                    name === 'value' ? 'Value' : name === 'stock' ? 'Stock' : 'Price'
                  ]}
                />
                <Bar dataKey="stock" fill="#10b981" name="Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Products</CardTitle>
            <CardDescription>Latest products in inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentlyAddedData.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(product.price)}</p>
                    <p className="text-sm text-green-600">
                      Margin: {formatCurrency(product.margin)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock vs Price Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Stock vs Price Analysis</CardTitle>
            <CardDescription>Relationship between stock levels and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {stockPriceAnalysisData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No product data available for analysis</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={stockPriceAnalysisData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'price' ? formatCurrency(value) : formatNumber(value),
                    name === 'price' ? 'Price' : 'Stock'
                  ]}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return `${payload[0].payload.fullName || payload[0].payload.name}`;
                    }
                    return '';
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stock"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Stock"
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Price"
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                  <TrendingUpIcon className="h-4 w-4" />
                  Stock and Price Analysis
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  {stockPriceAnalysisData.length} products analyzed
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                Low Stock Alerts ({filteredLowStockProducts.length})
              </CardTitle>
              <CardDescription>Products that need immediate attention</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
              >
                {showLowStock ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showLowStock ? (
            <div className="space-y-4">
              {filteredLowStockProducts.length > 0 ? (
                filteredLowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Package className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">Price: {formatCurrency(product.price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">
                        {product.stockQuantity} / {product.minStockLevel}
                      </p>
                      <p className="text-xs text-gray-500">Current / Min Level</p>
                      <p className="text-xs text-gray-500">Max: {product.maxStockLevel}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No low stock products found
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Low stock alerts are hidden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Out of Stock Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                Out of Stock Alerts ({filteredOutOfStockProducts.length})
              </CardTitle>
              <CardDescription>Products that are completely out of stock</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverstock(!showOverstock)}
              >
                {showOverstock ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showOverstock ? (
            <div className="space-y-4">
              {filteredOutOfStockProducts.length > 0 ? (
                filteredOutOfStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">Price: {formatCurrency(product.price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {product.stockQuantity} / {product.minStockLevel}
                      </p>
                      <p className="text-xs text-gray-500">Current / Min Level</p>
                      <p className="text-xs text-gray-500">Max: {product.maxStockLevel}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No out of stock products found
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Out of stock alerts are hidden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;