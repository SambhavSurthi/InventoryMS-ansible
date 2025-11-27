package com.ims.inventoryms.repository;

import com.ims.inventoryms.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Product entity operations
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * Find product by SKU
     */
    Optional<Product> findBySku(String sku);
    
    /**
     * Find product by barcode
     */
    Optional<Product> findByBarcode(String barcode);
    
    /**
     * Check if SKU exists
     */
    boolean existsBySku(String sku);
    
    /**
     * Check if barcode exists
     */
    boolean existsByBarcode(String barcode);
    
    /**
     * Find active products
     */
    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    Page<Product> findActiveProducts(Pageable pageable);
    
    /**
     * Find products by category
     */
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);
    
    /**
     * Search products by name, description, or brand
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "p.isActive = true")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);
    
    /**
     * Search products by category and search term
     */
    @Query("SELECT p FROM Product p WHERE " +
           "p.category.id = :categoryId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "p.isActive = true")
    Page<Product> searchProductsByCategory(@Param("search") String search, 
                                          @Param("categoryId") Long categoryId, 
                                          Pageable pageable);
    
    /**
     * Find low stock products
     */
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.minStockLevel AND p.isActive = true")
    List<Product> findLowStockProducts();
    
    /**
     * Find out of stock products
     */
    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= 0 AND p.isActive = true")
    List<Product> findOutOfStockProducts();
    
    /**
     * Find products by price range
     */
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice AND p.isActive = true")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                   @Param("maxPrice") BigDecimal maxPrice, 
                                   Pageable pageable);
    
    /**
     * Find products by brand
     */
    @Query("SELECT p FROM Product p WHERE LOWER(p.brand) = LOWER(:brand) AND p.isActive = true")
    Page<Product> findByBrand(@Param("brand") String brand, Pageable pageable);
    
    /**
     * Find products by supplier
     */
    @Query("SELECT p FROM Product p WHERE LOWER(p.supplier) = LOWER(:supplier) AND p.isActive = true")
    Page<Product> findBySupplier(@Param("supplier") String supplier, Pageable pageable);
    
    /**
     * Count products by category
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    long countByCategoryId(@Param("categoryId") Long categoryId);
    
    /**
     * Find top selling products (by order items)
     */
    @Query("SELECT p FROM Product p WHERE p.id IN " +
           "(SELECT oi.product.id FROM OrderItem oi GROUP BY oi.product.id ORDER BY SUM(oi.quantity) DESC)")
    List<Product> findTopSellingProducts(Pageable pageable);
    
    /**
     * Find recently added products
     */
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findRecentlyAddedProducts(Pageable pageable);
}
