import { useState, useCallback } from 'react';

export const useFormValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((field, value, allData = {}) => {
    const validator = validationSchema[field];
    if (validator) {
      const error = validator(value, allData);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
      return error;
    }
    return null;
  }, [validationSchema]);

  const validateForm = useCallback((data) => {
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
  }, [validationSchema]);

  const handleBlur = useCallback((field, value, allData = {}) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value, allData);
  }, [validateField]);

  const handleChange = useCallback((field, value, allData = {}) => {
    if (touched[field]) {
      validateField(field, value, allData);
    }
  }, [touched, validateField]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const hasFieldError = (field) => !!errors[field];
  const isFieldTouched = (field) => !!touched[field];

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    handleChange,
    reset,
    setFieldError,
    clearFieldError,
    hasErrors,
    hasFieldError,
    isFieldTouched
  };
};
