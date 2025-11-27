import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { showSuccess } = useToast();

  const handleLogout = async () => {
    try {
      const result = await dispatch(logout());
      if (logout.fulfilled.match(result)) {
        showSuccess('Logged out successfully!');
      }
    } catch (error) {
      // Even if there's an error, the logout will still clear local storage
      showSuccess('Logged out successfully!');
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MANAGER', 'SALES']
    },
    {
      name: 'Inventory',
      href: '/app/inventory',
      icon: BarChart3,
      roles: ['MANAGER', 'ADMIN']
    },
    {
      name: 'Sales',
      href: '/app/sales',
      icon: TrendingUp,
      roles: ['SALES', 'ADMIN']
    },
    {
      name: 'Orders',
      href: '/app/orders',
      icon: ShoppingCart,
      roles: ['SALES', 'ADMIN']
    },
    
    {
      name: 'Categories',
      href: '/app/categories',
      icon: Package,
      roles: ['ADMIN']
    },
    {
      name: 'Products',
      href: '/app/products',
      icon: Package,
      roles: ['ADMIN', 'MANAGER', 'SALES']
    },
    {
      name: 'Users',
      href: '/app/users',
      icon: Users,
      roles: ['ADMIN']
    },
    {
      name: 'Profile',
      href: '/app/profile',
      icon: User,
      roles: ['ADMIN', 'MANAGER', 'SALES']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role?.name || user?.role)
  );

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">InventoryMS</h1>
        <p className="text-sm text-gray-600">Inventory Management System</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
