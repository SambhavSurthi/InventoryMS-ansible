import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Package, Users, ShoppingCart, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { fetchInventoryDashboard } from '../store/slices/dashboardSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { fetchOrders } from '../store/slices/orderSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Get data from different slices
  const { inventoryDashboard } = useSelector((state) => state.dashboard);
  const { users } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchInventoryDashboard());
    dispatch(fetchUsers({ page: 0, size: 1000 }));
    dispatch(fetchOrders({ page: 0, size: 1000 }));
  }, [dispatch]);

  const getWelcomeMessage = () => {
    const role = user?.role?.name?.toLowerCase() || user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return 'Welcome to the Admin Dashboard';
      case 'manager':
        return 'Welcome to the Manager Dashboard';
      case 'sales':
        return 'Welcome to the Sales Dashboard';
      default:
        return 'Welcome to the Dashboard';
    }
  };

  const getQuickActions = () => {
    const role = user?.role?.name?.toLowerCase() || user?.role?.toLowerCase();
    
    const actions = [
      {
        title: 'Products',
        description: 'Manage inventory products',
        icon: Package,
        path: '/app/products'
      }
    ];

    if (role === 'admin') {
      actions.push(
        {
          title: 'Users',
          description: 'Manage system users',
          icon: Users,
          path: '/app/users'
        },
        {
          title: 'Categories',
          description: 'Manage product categories',
          icon: Package,
          path: '/app/categories'
        }
      );
    }

    if (['sales', 'admin'].includes(role)) {
      actions.push(
        {
          title: 'Orders',
          description: 'Manage customer orders',
          icon: ShoppingCart,
          path: '/app/orders'
        },
        {
          title: 'Sales Analytics',
          description: 'View sales performance',
          icon: TrendingUp,
          path: '/app/sales'
        }
      );
    }

    if (['manager', 'admin'].includes(role)) {
      actions.push(
        {
          title: 'Inventory',
          description: 'Monitor stock levels',
          icon: Package,
          path: '/app/inventory'
        }
      );
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getWelcomeMessage()}
        </h1>
        <p className="mt-2 text-gray-600">
          Hello {user?.firstName}, manage your inventory efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getQuickActions().map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => navigate(action.path)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Go to {action.title} →
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  {user?.firstName} {user?.lastName} logged in
                </p>
                <span className="text-xs text-gray-400">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Now'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  {inventoryDashboard?.totalProducts || 0} products in inventory
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  {orders?.content?.length || 0} total orders processed
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  {users?.content?.length || 0} users registered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Quick Stats
            </CardTitle>
            <CardDescription>System overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Products</span>
                <span className="text-lg font-semibold text-blue-600">
                  {inventoryDashboard?.totalProducts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Products</span>
                <span className="text-lg font-semibold text-green-600">
                  {inventoryDashboard?.activeProducts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-lg font-semibold text-purple-600">
                  {orders?.content?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-lg font-semibold text-orange-600">
                  {users?.content?.filter(user => user.isActive)?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inventory Value</span>
                <span className="text-lg font-semibold text-indigo-600">
                  ₹{inventoryDashboard?.totalInventoryValue?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
