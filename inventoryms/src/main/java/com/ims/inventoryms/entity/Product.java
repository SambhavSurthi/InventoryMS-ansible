package com.ims.inventoryms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Product entity representing items in the inventory system
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;
    
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    @Column(name = "sku", unique = true, length = 50)
    private String sku; // Stock Keeping Unit
    
    @NotBlank(message = "Barcode is required")
    @Size(max = 100, message = "Barcode must not exceed 100 characters")
    @Column(name = "barcode", nullable = false, unique = true, length = 100)
    private String barcode;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", message = "Cost price must be greater than or equal to 0")
    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;
    
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be greater than or equal to 0")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;
    
    @NotNull(message = "Minimum stock level is required")
    @Min(value = 0, message = "Minimum stock level must be greater than or equal to 0")
    @Column(name = "min_stock_level", nullable = false)
    private Integer minStockLevel = 0;
    
    @NotNull(message = "Maximum stock level is required")
    @Min(value = 1, message = "Maximum stock level must be greater than 0")
    @Column(name = "max_stock_level", nullable = false)
    private Integer maxStockLevel = 1000;
    
    @Size(max = 20, message = "Unit of measurement must not exceed 20 characters")
    @Column(name = "unit", length = 20)
    private String unit; // e.g., "pieces", "kg", "liters"
    
    @Size(max = 100, message = "Brand must not exceed 100 characters")
    @Column(name = "brand", length = 100)
    private String brand;
    
    @Size(max = 100, message = "Supplier must not exceed 100 characters")
    @Column(name = "supplier", length = 100)
    private String supplier;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Category is required")
    private Category category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public boolean isLowStock() {
        return stockQuantity <= minStockLevel;
    }
    
    public boolean isOutOfStock() {
        return stockQuantity <= 0;
    }
    
    public boolean isOverstocked() {
        return stockQuantity >= maxStockLevel;
    }
    
    public BigDecimal getProfitMargin() {
        if (costPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return price.subtract(costPrice).divide(costPrice, 4, java.math.RoundingMode.HALF_UP);
    }
    
    public BigDecimal getProfitAmount() {
        return price.subtract(costPrice);
    }
    
    public void updateStock(Integer quantity) {
        if (this.stockQuantity + quantity < 0) {
            throw new IllegalArgumentException("Insufficient stock available");
        }
        this.stockQuantity += quantity;
    }
    
    public boolean getIsActive() {
        return isActive != null ? isActive : false;
    }
    
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
}
