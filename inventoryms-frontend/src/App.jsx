import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import InventoryDashboard from './pages/InventoryDashboard';
import SalesDashboard from './pages/SalesDashboard';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="categories" element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <Categories />
                </ProtectedRoute>
              } />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={
                <ProtectedRoute requiredRoles={['SALES', 'ADMIN']}>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="inventory" element={
                <ProtectedRoute requiredRoles={['MANAGER', 'ADMIN']}>
                  <InventoryDashboard />
                </ProtectedRoute>
              } />
              <Route path="sales" element={
                <ProtectedRoute requiredRoles={['SALES', 'ADMIN']}>
                  <SalesDashboard />
                </ProtectedRoute>
              } />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </ToastProvider>
    </Provider>
  );
}

export default App;