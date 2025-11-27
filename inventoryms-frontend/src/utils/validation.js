// Validation utility functions for form validation
import { useState } from 'react';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 6;
  return password.length >= minLength;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

export const validateNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

export const validateNonNegativeNumber = (value) => {
  return validateNumber(value) && parseFloat(value) >= 0;
};

export const validateDecimal = (value, decimalPlaces = 2) => {
  const regex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`);
  return regex.test(value);
};

export const validateSKU = (sku) => {
  // SKU should be alphanumeric and 3-20 characters
  const skuRegex = /^[A-Za-z0-9]{3,20}$/;
  return skuRegex.test(sku);
};

export const validateBarcode = (barcode) => {
  // Barcode should be numeric and 8-13 characters
  const barcodeRegex = /^[0-9]{8,13}$/;
  return barcodeRegex.test(barcode);
};

export const validateUsername = (username) => {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateName = (name) => {
  // Name should be 2-50 characters, letters, spaces, hyphens, and apostrophes only
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

export const validateAddress = (address) => {
  // Address should be 10-200 characters
  return address && address.length >= 10 && address.length <= 200;
};

export const validateOrderItems = (items) => {
  return items && items.length > 0 && items.every(item => 
    item.productId && 
    item.quantity > 0 && 
    item.price > 0
  );
};

// Form validation schemas
export const loginValidation = {
  username: (value) => {
    if (!validateRequired(value)) return 'Username is required';
    if (!validateMinLength(value, 3)) return 'Username must be at least 3 characters';
    if (!validateMaxLength(value, 20)) return 'Username must be less than 20 characters';
    if (!validateUsername(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },
  password: (value) => {
    if (!validateRequired(value)) return 'Password is required';
    if (!validatePassword(value)) return 'Password must be at least 6 characters';
    return null;
  }
};

export const registerValidation = {
  username: (value) => {
    if (!validateRequired(value)) return 'Username is required';
    if (!validateMinLength(value, 3)) return 'Username must be at least 3 characters';
    if (!validateMaxLength(value, 20)) return 'Username must be less than 20 characters';
    if (!validateUsername(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },
  email: (value) => {
    if (!validateRequired(value)) return 'Email is required';
    if (!validateEmail(value)) return 'Please enter a valid email address';
    return null;
  },
  password: (value) => {
    if (!validateRequired(value)) return 'Password is required';
    if (!validatePassword(value)) return 'Password must be at least 6 characters';
    return null;
  },
  confirmPassword: (value, password) => {
    if (!validateRequired(value)) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  },
  firstName: (value) => {
    if (!validateRequired(value)) return 'First name is required';
    if (!validateName(value)) return 'Please enter a valid first name';
    return null;
  },
  lastName: (value) => {
    if (!validateRequired(value)) return 'Last name is required';
    if (!validateName(value)) return 'Please enter a valid last name';
    return null;
  },
  phone: (value) => {
    if (value && !validatePhone(value)) return 'Please enter a valid phone number';
    return null;
  }
};

export const userValidation = {
  username: (value) => {
    if (!validateRequired(value)) return 'Username is required';
    if (!validateMinLength(value, 3)) return 'Username must be at least 3 characters';
    if (!validateMaxLength(value, 20)) return 'Username must be less than 20 characters';
    if (!validateUsername(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },
  email: (value) => {
    if (!validateRequired(value)) return 'Email is required';
    if (!validateEmail(value)) return 'Please enter a valid email address';
    return null;
  },
  password: (value, isEdit = false) => {
    if (!isEdit && !validateRequired(value)) return 'Password is required';
    if (value && !validatePassword(value)) return 'Password must be at least 6 characters';
    return null;
  },
  firstName: (value) => {
    if (!validateRequired(value)) return 'First name is required';
    if (!validateName(value)) return 'Please enter a valid first name';
    return null;
  },
  lastName: (value) => {
    if (!validateRequired(value)) return 'Last name is required';
    if (!validateName(value)) return 'Please enter a valid last name';
    return null;
  },
  phone: (value) => {
    if (value && !validatePhone(value)) return 'Please enter a valid phone number';
    return null;
  }
};

export const categoryValidation = {
  name: (value) => {
    if (!validateRequired(value)) return 'Category name is required';
    if (!validateMinLength(value, 2)) return 'Category name must be at least 2 characters';
    if (!validateMaxLength(value, 100)) return 'Category name must be less than 100 characters';
    return null;
  },
  description: (value) => {
    if (value && !validateMaxLength(value, 500)) return 'Description must be less than 500 characters';
    return null;
  }
};

export const productValidation = {
  name: (value) => {
    if (!validateRequired(value)) return 'Product name is required';
    if (!validateMinLength(value, 2)) return 'Product name must be at least 2 characters';
    if (!validateMaxLength(value, 255)) return 'Product name must be less than 255 characters';
    return null;
  },
  description: (value) => {
    if (value && !validateMaxLength(value, 1000)) return 'Description must be less than 1000 characters';
    return null;
  },
  price: (value) => {
    if (!validateRequired(value)) return 'Price is required';
    if (!validatePositiveNumber(value)) return 'Price must be a positive number';
    if (!validateDecimal(value, 2)) return 'Price can have at most 2 decimal places';
    return null;
  },
  costPrice: (value) => {
    if (!validateRequired(value)) return 'Cost price is required';
    if (!validateNonNegativeNumber(value)) return 'Cost price must be a non-negative number';
    if (!validateDecimal(value, 2)) return 'Cost price can have at most 2 decimal places';
    return null;
  },
  stockQuantity: (value) => {
    if (!validateRequired(value)) return 'Stock quantity is required';
    if (!validateNonNegativeNumber(value)) return 'Stock quantity must be a non-negative number';
    return null;
  },
  minStockLevel: (value) => {
    if (!validateRequired(value)) return 'Minimum stock level is required';
    if (!validateNonNegativeNumber(value)) return 'Minimum stock level must be a non-negative number';
    return null;
  },
  maxStockLevel: (value) => {
    if (!validateRequired(value)) return 'Maximum stock level is required';
    if (!validatePositiveNumber(value)) return 'Maximum stock level must be a positive number';
    return null;
  },
  sku: (value) => {
    if (value && !validateSKU(value)) return 'SKU must be 3-20 alphanumeric characters';
    return null;
  },
  barcode: (value) => {
    if (value && !validateBarcode(value)) return 'Barcode must be 8-13 numeric characters';
    return null;
  },
  brand: (value) => {
    if (value && !validateMaxLength(value, 100)) return 'Brand must be less than 100 characters';
    return null;
  },
  supplier: (value) => {
    if (value && !validateMaxLength(value, 100)) return 'Supplier must be less than 100 characters';
    return null;
  },
  unit: (value) => {
    if (value && !validateMaxLength(value, 20)) return 'Unit must be less than 20 characters';
    return null;
  }
};

export const orderValidation = {
  customerName: (value) => {
    if (!validateRequired(value)) return 'Customer name is required';
    if (!validateName(value)) return 'Please enter a valid customer name';
    return null;
  },
  customerEmail: (value) => {
    if (value && !validateEmail(value)) return 'Please enter a valid email address';
    return null;
  },
  customerPhone: (value) => {
    if (value && !validatePhone(value)) return 'Please enter a valid phone number';
    return null;
  },
  shippingAddress: (value) => {
    if (value && !validateAddress(value)) return 'Address must be 10-200 characters';
    return null;
  },
  items: (value) => {
    if (!validateOrderItems(value)) return 'Order must have at least one item';
    return null;
  }
};

export const stockUpdateValidation = {
  quantity: (value) => {
    if (!validateRequired(value)) return 'Quantity is required';
    if (!validateNumber(value)) return 'Quantity must be a valid number';
    return null;
  },
  notes: (value) => {
    if (value && !validateMaxLength(value, 500)) return 'Notes must be less than 500 characters';
    return null;
  }
};

// Generic form validation function
export const validateForm = (data, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach(field => {
    const validator = validationSchema[field];
    const value = data[field];
    const error = validator(value, data);
    
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};

// Real-time validation hook
export const useValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value, allData = {}) => {
    const validator = validationSchema[field];
    if (validator) {
      const error = validator(value, allData);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const validator = validationSchema[field];
      const value = data[field];
      const error = validator(value, data);
      
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { errors: newErrors, isValid };
  };

  const handleBlur = (field, value, allData = {}) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value, allData);
  };

  const handleChange = (field, value, allData = {}) => {
    if (touched[field]) {
      validateField(field, value, allData);
    }
  };

  const reset = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    handleChange,
    reset
  };
};
