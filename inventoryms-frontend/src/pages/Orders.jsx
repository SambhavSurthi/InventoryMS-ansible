import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, createOrder, updateOrderStatus, cancelOrder } from '../store/slices/orderSlice';
import { fetchProducts } from '../store/slices/productSlice';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Package,
  User,
  DollarSign,
  Calendar,
  X,
  Filter,
  ChevronDown,
  Check,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.order);
  const { products } = useSelector((state) => state.product);
  const { showSuccess, showError } = useToast();
  
  // Tab management
  const [activeTab, setActiveTab] = useState('manage');
  
  // Order management state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [editingOrderStatus, setEditingOrderStatus] = useState(null);
  
  // Create order form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'CASH',
    notes: '',
    orderItems: []
  });
  
  // Product search and selection
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    price: 0
  });
  
  // Status update form
  const [statusUpdateData, setStatusUpdateData] = useState({
    orderStatus: '',
    paymentStatus: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchOrders({ page: 0, size: 50 }));
    dispatch(fetchProducts({ page: 0, size: 1000 })); // Load more products for better search
  }, [dispatch]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !productSearchTerm || 
      product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchOrders({ 
      search: searchTerm, 
      status: statusFilter || undefined,
      page: 0, 
      size: 50 
    }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        orderItems: formData.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      };
      const result = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(result)) {
        showSuccess('Order created successfully!');
        resetForm();
        setActiveTab('manage');
        dispatch(fetchOrders({ page: 0, size: 50 }));
      } else {
        showError(result.payload || 'Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      showError('Failed to create order');
    }
  };

  const handleUpdateOrderStatus = async (orderId) => {
    try {
      const result = await dispatch(updateOrderStatus({ 
        id: orderId, 
        orderData: statusUpdateData 
      }));
      if (updateOrderStatus.fulfilled.match(result)) {
        showSuccess('Order status updated successfully!');
        setEditingOrderStatus(null);
        setStatusUpdateData({ orderStatus: '', paymentStatus: '', notes: '' });
        dispatch(fetchOrders({ page: 0, size: 50 }));
      } else {
        showError(result.payload || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      showError('Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      try {
        const result = await dispatch(cancelOrder({ id: orderId, reason }));
        if (cancelOrder.fulfilled.match(result)) {
          showSuccess('Order cancelled successfully!');
          dispatch(fetchOrders({ page: 0, size: 50 }));
        } else {
          showError(result.payload || 'Failed to cancel order');
        }
      } catch (error) {
        console.error('Failed to cancel order:', error);
        showError('Failed to cancel order');
      }
    }
  };

  const handleEditOrderStatus = (order) => {
    setEditingOrderStatus(order);
    setStatusUpdateData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      notes: ''
    });
  };

  const addItemToOrder = () => {
    if (newItem.productId && newItem.quantity > 0) {
      const product = products.find(p => p.id === parseInt(newItem.productId));
      if (product) {
        const item = {
          productId: parseInt(newItem.productId),
          productName: product.name,
          quantity: parseInt(newItem.quantity),
          price: parseFloat(newItem.price),
          totalPrice: parseFloat(newItem.price) * parseInt(newItem.quantity)
        };
        setFormData({
          ...formData,
          orderItems: [...formData.orderItems, item]
        });
        setNewItem({ productId: '', quantity: 1, price: 0 });
        setProductSearchTerm('');
        setShowProductDropdown(false);
      }
    }
  };

  const removeItemFromOrder = (index) => {
    const updatedItems = formData.orderItems.filter((_, i) => i !== index);
    setFormData({ ...formData, orderItems: updatedItems });
  };

  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.orderItems];
    updatedItems[index].quantity = parseInt(quantity);
    updatedItems[index].totalPrice = updatedItems[index].price * parseInt(quantity);
    setFormData({ ...formData, orderItems: updatedItems });
  };

  const selectProduct = (product) => {
    setNewItem({
      productId: product.id,
      quantity: 1,
      price: product.price
    });
    setProductSearchTerm(product.name);
    setShowProductDropdown(false);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      paymentMethod: 'CASH',
      notes: '',
      orderItems: []
    });
    setNewItem({ productId: '', quantity: 1, price: 0 });
    setProductSearchTerm('');
    setSelectedCategory('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotal = () => {
    return formData.orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    const matchesPaymentStatus = !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;
    const matchesDate = !dateFilter || new Date(order.orderDate).toDateString() === new Date(dateFilter).toDateString();
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
  });

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Manage Orders
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Create Order
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search orders by number, customer name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <div className="flex space-x-4">
                  <div className="w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Order Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="w-48">
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Payment Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                  <div className="w-48">
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>Manage customer orders and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading orders...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">Error: {error}</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No orders found</div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-blue-500" />
                          <div>
                            <h3 className="font-medium text-gray-900">{order.orderNumber || `#ORD-${order.id}`}</h3>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowOrderDetails(order)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {order.orderStatus !== 'DELIVERED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditOrderStatus(order)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Amount</p>
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Items</p>
                          <p className="font-medium">{order.orderItems?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Order Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500">Payment Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      
                      {order.orderDate && (
                        <div className="mt-3 text-xs text-gray-500">
                          Order Date: {formatDate(order.orderDate)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Order Tab */}
      {activeTab === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
            <CardDescription>Create a new customer order with items</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrder} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="Enter customer email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="Enter customer phone"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="DIGITAL_WALLET">Digital Wallet</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <textarea
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter shipping address"
                />
              </div>

              {/* Order Items */}
              <div>
                <Label>Order Items *</Label>
                <div className="space-y-4">
                  {/* Add Item Form with Advanced Search */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Search products by name or description..."
                          value={productSearchTerm}
                          onChange={(e) => {
                            setProductSearchTerm(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                        />
                        {showProductDropdown && filteredProducts.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredProducts.slice(0, 10).map((product) => (
                              <div
                                key={product.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                                onClick={() => selectProduct(product)}
                              >
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-600">{formatCurrency(product.price)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                          placeholder="Qty"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          placeholder="Price"
                        />
                      </div>
                      <Button type="button" onClick={addItemToOrder} disabled={!newItem.productId}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Items List */}
                  {formData.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, e.target.value)}
                          className="w-20"
                        />
                        <span className="w-24 text-right font-medium">{formatCurrency(item.totalPrice)}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItemFromOrder(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  {formData.orderItems.length > 0 && (
                    <div className="flex justify-end p-3 bg-gray-100 rounded-lg">
                      <span className="text-lg font-bold">Total: {formatCurrency(calculateTotal())}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes for this order"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading || formData.orderItems.length === 0}>
                  {isLoading ? 'Creating...' : 'Create Order'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Details - {showOrderDetails.orderNumber || `#ORD-${showOrderDetails.id}`}</CardTitle>
                  <CardDescription>Complete order information and items</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowOrderDetails(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Order Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(showOrderDetails.orderStatus)}`}>
                    {showOrderDetails.orderStatus}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Payment Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(showOrderDetails.paymentStatus)}`}>
                    {showOrderDetails.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{showOrderDetails.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {showOrderDetails.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {showOrderDetails.customerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{showOrderDetails.paymentMethod}</p>
                  </div>
                </div>
                {showOrderDetails.shippingAddress && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="font-medium flex items-start">
                      <MapPin className="h-3 w-3 mr-1 mt-1" />
                      {showOrderDetails.shippingAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Items
                </h4>
                <div className="space-y-2">
                  {showOrderDetails.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.totalAmount || item.subtotal)}</p>
                        {item.discountAmount > 0 && (
                          <p className="text-xs text-green-600">Discount: {formatCurrency(item.discountAmount)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(showOrderDetails.subtotal)}</span>
                    </div>
                    {showOrderDetails.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(showOrderDetails.taxAmount)}</span>
                      </div>
                    )}
                    {showOrderDetails.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(showOrderDetails.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(showOrderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Dates */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Order Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{formatDate(showOrderDetails.orderDate)}</p>
                  </div>
                  {showOrderDetails.shippedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Shipped Date</p>
                      <p className="font-medium flex items-center">
                        <Truck className="h-3 w-3 mr-1" />
                        {formatDate(showOrderDetails.shippedDate)}
                      </p>
                    </div>
                  )}
                  {showOrderDetails.deliveredDate && (
                    <div>
                      <p className="text-sm text-gray-600">Delivered Date</p>
                      <p className="font-medium flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        {formatDate(showOrderDetails.deliveredDate)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(showOrderDetails.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{formatDate(showOrderDetails.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {showOrderDetails.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{showOrderDetails.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Update Modal */}
      {editingOrderStatus && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Update Order Status</CardTitle>
                <Button variant="outline" onClick={() => setEditingOrderStatus(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Update status for order {editingOrderStatus.orderNumber || `#ORD-${editingOrderStatus.id}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderStatus">Order Status</Label>
                <select
                  id="orderStatus"
                  value={statusUpdateData.orderStatus}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, orderStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <select
                  id="paymentStatus"
                  value={statusUpdateData.paymentStatus}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={statusUpdateData.notes}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add notes about this status update"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleUpdateOrderStatus(editingOrderStatus.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Status'}
                </Button>
                <Button variant="outline" onClick={() => setEditingOrderStatus(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Orders;