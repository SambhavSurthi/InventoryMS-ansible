import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct, updateStock } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Package, Plus, Edit, Trash2, Search, Package2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { IndianRupee } from "lucide-react";

const Products = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { showSuccess, showError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showStockModal, setShowStockModal] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ quantity: 0, operation: 'ADD', notes: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    stockQuantity: 0,
    minStockLevel: 10,
    maxStockLevel: 100,
    unit: 'pcs',
    sku: '',
    barcode: '',
    brand: '',
    supplier: '',
    categoryId: '',
    active: true
  });

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 50 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ 
      search: searchTerm, 
      categoryId: selectedCategory || undefined,
      page: 0, 
      size: 50 
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(createProduct(formData));
      if (createProduct.fulfilled.match(result)) {
        showSuccess('Product created successfully!');
        setShowCreateForm(false);
        resetForm();
        dispatch(fetchProducts({ page: 0, size: 50 }));
      } else {
        showError(result.payload || 'Failed to create product');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      showError('Failed to create product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateProduct({ id: editingProduct.id, productData: formData }));
      if (updateProduct.fulfilled.match(result)) {
        showSuccess('Product updated successfully!');
        setEditingProduct(null);
        resetForm();
        dispatch(fetchProducts({ page: 0, size: 50 }));
      } else {
        showError(result.payload || 'Failed to update product');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      showError('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const result = await dispatch(deleteProduct(id));
        if (deleteProduct.fulfilled.match(result)) {
          showSuccess('Product deleted successfully!');
          dispatch(fetchProducts({ page: 0, size: 50 }));
        } else {
          showError(result.payload || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        showError('Failed to delete product');
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      costPrice: product.costPrice.toString(),
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      unit: product.unit || 'pcs',
      sku: product.sku || '',
      barcode: product.barcode || '',
      brand: product.brand || '',
      supplier: product.supplier || '',
      categoryId: product.categoryId || '',
      active: product.active
    });
    setShowCreateForm(true);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateStock({ 
        id: showStockModal.id, 
        stockData: {
          quantity: parseInt(stockUpdate.quantity),
          operation: stockUpdate.operation,
          notes: stockUpdate.notes 
        }
      }));
      if (updateStock.fulfilled.match(result)) {
        showSuccess('Stock updated successfully!');
        setShowStockModal(null);
        setStockUpdate({ quantity: 0, operation: 'ADD', notes: '' });
        dispatch(fetchProducts({ page: 0, size: 50 }));
      } else {
        showError(result.payload || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
      showError('Failed to update stock');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      stockQuantity: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unit: 'pcs',
      sku: '',
      barcode: '',
      brand: '',
      supplier: '',
      categoryId: '',
      active: true
    });
  };

  const getStockStatus = (product) => {
    if (product.stockQuantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (product.stockQuantity <= product.minStockLevel) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (product.stockQuantity > product.maxStockLevel) return { status: 'Overstocked', color: 'bg-orange-100 text-orange-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search products by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</CardTitle>
            <CardDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    required
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStockLevel">Min Stock</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
                    required
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="maxStockLevel">Max Stock</Label>
                  <Input
                    id="maxStockLevel"
                    type="number"
                    value={formData.maxStockLevel}
                    onChange={(e) => setFormData({ ...formData, maxStockLevel: parseInt(e.target.value) })}
                    required
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Enter brand"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Enter supplier"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter barcode"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowCreateForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>Manage products and inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Package2 className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">SKU:</span>
                        <span className="font-medium">{product.sku || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{product.categoryName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price:</span>
                        <div className='flex  items-center justify-center' >
                          <IndianRupee className="h-4 w-4 text-black" />
                          <span className="font-medium">{parseFloat(product.price).toFixed(2)}</span>
                        </div>
                       
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Stock:</span>
                        
                        <span className="font-medium">{product.stockQuantity} {product.unit}</span>
                      </div>
                      {product.brand && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Brand:</span>
                          <span className="font-medium">{product.brand}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowStockModal(product)}
                      >
                        Update Stock
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-white bg-opacity-0 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Update Stock - {showStockModal.name}</CardTitle>
              <CardDescription>Current stock: {showStockModal.stockQuantity} {showStockModal.unit}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="operation">Operation</Label>
                  <select
                    id="operation"
                    value={stockUpdate.operation}
                    onChange={(e) => setStockUpdate({ ...stockUpdate, operation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="ADD">Add Stock</option>
                    <option value="SUBTRACT">Subtract Stock</option>
                    <option value="SET">Set Stock</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={stockUpdate.quantity}
                    onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={stockUpdate.notes}
                    onChange={(e) => setStockUpdate({ ...stockUpdate, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter notes for this stock update"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Stock'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowStockModal(null);
                    setStockUpdate({ quantity: 0, notes: '' });
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Products;