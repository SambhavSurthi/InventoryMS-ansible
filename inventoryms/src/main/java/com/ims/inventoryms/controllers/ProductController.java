package com.ims.inventoryms.controllers;

import com.ims.inventoryms.dto.ProductRequest;
import com.ims.inventoryms.dto.ProductResponse;
import com.ims.inventoryms.dto.StockUpdateRequest;
import com.ims.inventoryms.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for product management endpoints
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {
    
    private final ProductService productService;
    
    /**
     * Get all products (Public)
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        
        log.info("Fetching all products with pagination: {}", pageable);
        
        Page<ProductResponse> products = productService.getAllProducts(pageable);
        
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get product by ID (Public)
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.info("Fetching product by ID: {}", id);
        
        ProductResponse product = productService.getProductById(id);
        
        return ResponseEntity.ok(product);
    }
    
    /**
     * Search products (Public)
     */
    @GetMapping("/products/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String supplier,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        
        log.info("Searching products with query: {}, categoryId: {}", query, categoryId);
        
        Page<ProductResponse> products = productService.searchProducts(query, categoryId, minPrice, maxPrice, brand, supplier, pageable);
        
        return ResponseEntity.ok(products);
    }
    
    /**
     * Create new product (Admin only)
     */
    @PostMapping("/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest productRequest) {
        log.info("Creating new product: {}", productRequest.getName());
        
        ProductResponse product = productService.createProduct(productRequest);
        
        log.info("Product created successfully with ID: {}", product.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }
    
    /**
     * Update product by ID (Admin only)
     */
    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, 
                                                        @Valid @RequestBody ProductRequest productRequest) {
        log.info("Updating product with ID: {}", id);
        
        ProductResponse product = productService.updateProduct(id, productRequest);
        
        log.info("Product updated successfully: {}", product.getName());
        
        return ResponseEntity.ok(product);
    }
    
    /**
     * Delete product by ID (Admin only)
     */
    @DeleteMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("Deleting product with ID: {}", id);
        
        productService.deleteProduct(id);
        
        log.info("Product deleted successfully");
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Update product stock (Manager/Admin only)
     */
    @PutMapping("/manager/products/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> updateStock(@PathVariable Long id, 
                                                      @Valid @RequestBody StockUpdateRequest stockUpdateRequest) {
        log.info("Updating stock for product ID: {}", id);
        
        ProductResponse product = productService.updateStock(id, stockUpdateRequest);
        
        log.info("Stock updated successfully for product: {}", product.getName());
        
        return ResponseEntity.ok(product);
    }
    
    /**
     * Get products by category (Public)
     */
    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId,
                                                                      @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        log.info("Fetching products by category ID: {}", categoryId);
        
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, pageable);
        
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get low stock products (Manager/Admin only)
     */
    @GetMapping("/manager/products/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        log.info("Fetching low stock products");
        
        List<ProductResponse> products = productService.getLowStockProducts();
        
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get out of stock products (Manager/Admin only)
     */
    @GetMapping("/manager/products/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        log.info("Fetching out of stock products");
        
        List<ProductResponse> products = productService.getOutOfStockProducts();
        
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get top selling products (Public)
     */
    @GetMapping("/products/top-selling")
    public ResponseEntity<List<ProductResponse>> getTopSellingProducts() {
        log.info("Fetching top selling products");
        
        List<ProductResponse> products = productService.getTopSellingProducts();
        
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get recently added products (Public)
     */
    @GetMapping("/products/recent")
    public ResponseEntity<List<ProductResponse>> getRecentlyAddedProducts() {
        log.info("Fetching recently added products");
        
        List<ProductResponse> products = productService.getRecentlyAddedProducts();
        
        return ResponseEntity.ok(products);
    }
}
