import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Package, Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector((state) => state.category);
  const { showSuccess, showError } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: null,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(createCategory(formData));
      if (createCategory.fulfilled.match(result)) {
        showSuccess('Category created successfully!');
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          parentCategoryId: null,
          isActive: true
        });
        dispatch(fetchCategories());
      } else {
        showError(result.payload || 'Failed to create category');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      showError('Failed to create category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateCategory({ id: editingCategory.id, categoryData: formData }));
      if (updateCategory.fulfilled.match(result)) {
        showSuccess('Category updated successfully!');
        setEditingCategory(null);
        setFormData({
          name: '',
          description: '',
          parentCategoryId: null,
          isActive: true
        });
        dispatch(fetchCategories());
      } else {
        showError(result.payload || 'Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      showError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const result = await dispatch(deleteCategory(id));
        if (deleteCategory.fulfilled.match(result)) {
          showSuccess('Category deleted successfully!');
          dispatch(fetchCategories());
        } else {
          showError(result.payload || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
        showError('Failed to delete category');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parentCategoryId: category.parentCategoryId,
      isActive: category.isActive
    });
    setShowCreateForm(true);
  };

  const rootCategories = categories.filter(cat => !cat.parentCategoryId);
  const getSubCategories = (parentId) => categories.filter(cat => cat.parentCategoryId === parentId);

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className={`ml-${level * 4} border-l-2 border-gray-200 pl-4 mb-4`}>
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            {getSubCategories(category.id).length > 0 ? (
              <FolderOpen className="h-5 w-5 text-blue-500" />
            ) : (
              <Folder className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">
                  {category.productCount || 0} products
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditCategory(category)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {getSubCategories(category.id).length > 0 && (
          <div className="mt-2">
            {renderCategoryTree(getSubCategories(category.id), level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</CardTitle>
            <CardDescription>
              {editingCategory ? 'Update category information' : 'Add a new category to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="Enter category description"
                />
              </div>
              
              <div>
                <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
                <select
                  id="parentCategory"
                  value={formData.parentCategoryId || ''}
                  onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value || null })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Parent (Root Category)</option>
                  {rootCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  required
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowCreateForm(false);
                  setEditingCategory(null);
                  setFormData({
                    name: '',
                    description: '',
                    parentCategoryId: null,
                    isActive: true
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
          <CardDescription>Manage product categories and subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading categories...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No categories found</div>
          ) : (
            <div className="space-y-4">
              {renderCategoryTree(rootCategories)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;
