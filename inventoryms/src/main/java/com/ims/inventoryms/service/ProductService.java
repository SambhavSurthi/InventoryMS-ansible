package com.ims.inventoryms.service;

import com.ims.inventoryms.dto.ProductRequest;
import com.ims.inventoryms.dto.ProductResponse;
import com.ims.inventoryms.dto.StockUpdateRequest;
import com.ims.inventoryms.entity.Category;
import com.ims.inventoryms.entity.Product;
import com.ims.inventoryms.repository.CategoryRepository;
import com.ims.inventoryms.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service class for product management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    /**
     * Get all active products with pagination
     */
    @Transactional(readOnly = true)
    public Page<Product> getAllActiveProducts(Pageable pageable) {
        return productRepository.findActiveProducts(pageable);
    }
    
    
    /**
     * Get product by SKU
     */
    @Transactional(readOnly = true)
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with SKU: " + sku));
    }
    
    /**
     * Get product by barcode
     */
    @Transactional(readOnly = true)
    public Product getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with barcode: " + barcode));
    }
    
    /**
     * Create a new product
     */
    public Product createProduct(Product product) {
        // Check if SKU already exists
        if (product.getSku() != null && !product.getSku().trim().isEmpty() && 
            productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + product.getSku());
        }
        
        // Check if barcode already exists
        if (productRepository.existsByBarcode(product.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + product.getBarcode());
        }
        
        // Validate category
        Category category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + product.getCategory().getId()));
        product.setCategory(category);
        
        // Validate stock levels
        if (product.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        
        if (product.getMinStockLevel() < 0) {
            throw new IllegalArgumentException("Minimum stock level cannot be negative");
        }
        
        if (product.getMaxStockLevel() <= 0) {
            throw new IllegalArgumentException("Maximum stock level must be greater than 0");
        }
        
        if (product.getMinStockLevel() > product.getMaxStockLevel()) {
            throw new IllegalArgumentException("Minimum stock level cannot be greater than maximum stock level");
        }
        
        Product savedProduct = productRepository.save(product);
        
        log.info("Product created successfully: {}", savedProduct.getName());
        
        return savedProduct;
    }
    
    /**
     * Update product by ID
     */
    public Product updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        
        // Check if SKU already exists (excluding current product)
        if (product.getSku() != null && !product.getSku().trim().isEmpty() && 
            !existingProduct.getSku().equals(product.getSku()) && 
            productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + product.getSku());
        }
        
        // Check if barcode already exists (excluding current product)
        if (!existingProduct.getBarcode().equals(product.getBarcode()) && 
            productRepository.existsByBarcode(product.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + product.getBarcode());
        }
        
        // Validate category
        Category category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + product.getCategory().getId()));
        
        // Validate stock levels
        if (product.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        
        if (product.getMinStockLevel() < 0) {
            throw new IllegalArgumentException("Minimum stock level cannot be negative");
        }
        
        if (product.getMaxStockLevel() <= 0) {
            throw new IllegalArgumentException("Maximum stock level must be greater than 0");
        }
        
        if (product.getMinStockLevel() > product.getMaxStockLevel()) {
            throw new IllegalArgumentException("Minimum stock level cannot be greater than maximum stock level");
        }
        
        // Update product fields
        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setSku(product.getSku());
        existingProduct.setBarcode(product.getBarcode());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCostPrice(product.getCostPrice());
        existingProduct.setStockQuantity(product.getStockQuantity());
        existingProduct.setMinStockLevel(product.getMinStockLevel());
        existingProduct.setMaxStockLevel(product.getMaxStockLevel());
        existingProduct.setUnit(product.getUnit());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setSupplier(product.getSupplier());
        existingProduct.setCategory(category);
        existingProduct.setIsActive(product.getIsActive());
        
        Product savedProduct = productRepository.save(existingProduct);
        
        log.info("Product updated successfully: {}", savedProduct.getName());
        
        return savedProduct;
    }
    
    /**
     * Delete product by ID
     */
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        
        productRepository.delete(product);
        
        log.info("Product deleted successfully: {}", product.getName());
    }
    
    /**
     * Update product stock
     */
    public Product updateStock(Long productId, Integer quantity, String operation, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        int newStockQuantity;
        switch (operation.toUpperCase()) {
            case "ADD":
                newStockQuantity = product.getStockQuantity() + quantity;
                break;
            case "SUBTRACT":
//            case "REMOVE":
                newStockQuantity = product.getStockQuantity() - quantity;
                if (newStockQuantity < 0) {
                    throw new IllegalArgumentException("Insufficient stock. Current stock: " + product.getStockQuantity());
                }
                break;
            case "SET":
                newStockQuantity = quantity;
                break;
            default:
                throw new IllegalArgumentException("Invalid operation. Use ADD, SUBTRACT, REMOVE, or SET");
        }
        
        product.setStockQuantity(newStockQuantity);
        Product savedProduct = productRepository.save(product);
        
        log.info("Stock updated for product {}: {} {} (operation: {})", 
                savedProduct.getName(), quantity, savedProduct.getUnit(), operation);
        
        return savedProduct;
    }
    
    
    /**
     * Get products by price range
     */
    @Transactional(readOnly = true)
    public Page<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceRange(minPrice, maxPrice, pageable);
    }
    
    /**
     * Get products by brand
     */
    @Transactional(readOnly = true)
    public Page<Product> getProductsByBrand(String brand, Pageable pageable) {
        return productRepository.findByBrand(brand, pageable);
    }
    
    /**
     * Get products by supplier
     */
    @Transactional(readOnly = true)
    public Page<Product> getProductsBySupplier(String supplier, Pageable pageable) {
        return productRepository.findBySupplier(supplier, pageable);
    }
    
    /**
     * Get top selling products
     */
    @Transactional(readOnly = true)
    public List<Product> getTopSellingProducts(Pageable pageable) {
        return productRepository.findTopSellingProducts(pageable);
    }
    
    /**
     * Get recently added products
     */
    @Transactional(readOnly = true)
    public List<Product> getRecentlyAddedProducts(Pageable pageable) {
        return productRepository.findRecentlyAddedProducts(pageable);
    }
    
    /**
     * Toggle product active status
     */
    public Product toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        
        product.setIsActive(!product.getIsActive());
        Product savedProduct = productRepository.save(product);
        
        log.info("Product status toggled to {} for product: {}", savedProduct.getIsActive(), savedProduct.getName());
        
        return savedProduct;
    }
    
    /**
     * Get all products (DTO-based)
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findActiveProducts(pageable);
        return products.map(this::mapToProductResponse);
    }
    
    /**
     * Get product by ID (DTO-based)
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return mapToProductResponse(product);
    }
    
    /**
     * Create new product (DTO-based)
     */
    public ProductResponse createProduct(ProductRequest productRequest) {
        // Check if SKU already exists
        if (productRequest.getSku() != null && !productRequest.getSku().trim().isEmpty() && 
            productRepository.existsBySku(productRequest.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + productRequest.getSku());
        }
        
        // Check if barcode already exists
        if (productRepository.existsByBarcode(productRequest.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + productRequest.getBarcode());
        }
        
        // Validate category
        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + productRequest.getCategoryId()));
        
        // Create new product
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setSku(productRequest.getSku());
        product.setBarcode(productRequest.getBarcode());
        product.setPrice(productRequest.getPrice());
        product.setCostPrice(productRequest.getCostPrice());
        product.setStockQuantity(productRequest.getStockQuantity());
        product.setMinStockLevel(productRequest.getMinStockLevel());
        product.setMaxStockLevel(productRequest.getMaxStockLevel());
        product.setUnit(productRequest.getUnit());
        product.setBrand(productRequest.getBrand());
        product.setSupplier(productRequest.getSupplier());
        product.setCategory(category);
        product.setIsActive(productRequest.getIsActive());
        
        Product savedProduct = productRepository.save(product);
        
        log.info("Product created successfully: {}", savedProduct.getName());
        
        return mapToProductResponse(savedProduct);
    }
    
    /**
     * Update product by ID (DTO-based)
     */
    public ProductResponse updateProduct(Long id, ProductRequest productRequest) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        
        // Check if SKU already exists (excluding current product)
        if (productRequest.getSku() != null && !productRequest.getSku().trim().isEmpty() && 
            !existingProduct.getSku().equals(productRequest.getSku()) && 
            productRepository.existsBySku(productRequest.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + productRequest.getSku());
        }
        
        // Check if barcode already exists (excluding current product)
        if (!existingProduct.getBarcode().equals(productRequest.getBarcode()) && 
            productRepository.existsByBarcode(productRequest.getBarcode())) {
            throw new IllegalArgumentException("Barcode already exists: " + productRequest.getBarcode());
        }
        
        // Validate category
        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + productRequest.getCategoryId()));
        
        // Update product fields
        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setSku(productRequest.getSku());
        existingProduct.setBarcode(productRequest.getBarcode());
        existingProduct.setPrice(productRequest.getPrice());
        existingProduct.setCostPrice(productRequest.getCostPrice());
        existingProduct.setStockQuantity(productRequest.getStockQuantity());
        existingProduct.setMinStockLevel(productRequest.getMinStockLevel());
        existingProduct.setMaxStockLevel(productRequest.getMaxStockLevel());
        existingProduct.setUnit(productRequest.getUnit());
        existingProduct.setBrand(productRequest.getBrand());
        existingProduct.setSupplier(productRequest.getSupplier());
        existingProduct.setCategory(category);
        existingProduct.setIsActive(productRequest.getIsActive());
        
        Product savedProduct = productRepository.save(existingProduct);
        
        log.info("Product updated successfully: {}", savedProduct.getName());
        
        return mapToProductResponse(savedProduct);
    }
    
    /**
     * Update stock (DTO-based)
     */
    public ProductResponse updateStock(Long productId, StockUpdateRequest stockUpdateRequest) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        
        if (stockUpdateRequest.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        int newStockQuantity;
        switch (stockUpdateRequest.getOperation()) {
            case ADD:
                newStockQuantity = product.getStockQuantity() + stockUpdateRequest.getQuantity();
                break;
            case SUBTRACT:
                newStockQuantity = product.getStockQuantity() - stockUpdateRequest.getQuantity();
                if (newStockQuantity < 0) {
                    throw new IllegalArgumentException("Insufficient stock. Current stock: " + product.getStockQuantity());
                }
                break;
            case SET:
                newStockQuantity = stockUpdateRequest.getQuantity();
                break;
            default:
                throw new IllegalArgumentException("Invalid operation: " + stockUpdateRequest.getOperation());
        }
        
        product.setStockQuantity(newStockQuantity);
        Product savedProduct = productRepository.save(product);
        
        log.info("Stock updated for product {}: {} {} (operation: {})", 
                savedProduct.getName(), stockUpdateRequest.getQuantity(), savedProduct.getUnit(), stockUpdateRequest.getOperation());
        
        return mapToProductResponse(savedProduct);
    }
    
    /**
     * Search products (DTO-based)
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String query, Long categoryId, BigDecimal minPrice, 
                                               BigDecimal maxPrice, String brand, String supplier, Pageable pageable) {
        Page<Product> products;
        
        if (categoryId != null && query != null && !query.trim().isEmpty()) {
            products = productRepository.searchProductsByCategory(query, categoryId, pageable);
        } else if (query != null && !query.trim().isEmpty()) {
            products = productRepository.searchProducts(query, pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else if (minPrice != null && maxPrice != null) {
            products = productRepository.findByPriceRange(minPrice, maxPrice, pageable);
        } else if (brand != null && !brand.trim().isEmpty()) {
            products = productRepository.findByBrand(brand, pageable);
        } else if (supplier != null && !supplier.trim().isEmpty()) {
            products = productRepository.findBySupplier(supplier, pageable);
        } else {
            products = productRepository.findActiveProducts(pageable);
        }
        
        return products.map(this::mapToProductResponse);
    }
    
    /**
     * Get products by category (DTO-based)
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> products = productRepository.findByCategoryId(categoryId, pageable);
        return products.map(this::mapToProductResponse);
    }
    
    /**
     * Get low stock products (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        List<Product> products = productRepository.findLowStockProducts();
        return products.stream().map(this::mapToProductResponse).toList();
    }
    
    /**
     * Get out of stock products (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getOutOfStockProducts() {
        List<Product> products = productRepository.findOutOfStockProducts();
        return products.stream().map(this::mapToProductResponse).toList();
    }
    
    /**
     * Get top selling products (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getTopSellingProducts() {
        List<Product> products = productRepository.findTopSellingProducts(
                org.springframework.data.domain.PageRequest.of(0, 10));
        return products.stream().map(this::mapToProductResponse).toList();
    }
    
    /**
     * Get recently added products (DTO-based)
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getRecentlyAddedProducts() {
        List<Product> products = productRepository.findRecentlyAddedProducts(
                org.springframework.data.domain.PageRequest.of(0, 10));
        return products.stream().map(this::mapToProductResponse).toList();
    }
    
    /**
     * Map Product entity to ProductResponse DTO
     */
    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .stockQuantity(product.getStockQuantity())
                .minStockLevel(product.getMinStockLevel())
                .maxStockLevel(product.getMaxStockLevel())
                .unit(product.getUnit())
                .brand(product.getBrand())
                .supplier(product.getSupplier())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .isActive(product.getIsActive())
                .isLowStock(product.isLowStock())
                .isOutOfStock(product.isOutOfStock())
                .isOverstocked(product.isOverstocked())
                .profitMargin(product.getProfitMargin())
                .profitAmount(product.getProfitAmount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
