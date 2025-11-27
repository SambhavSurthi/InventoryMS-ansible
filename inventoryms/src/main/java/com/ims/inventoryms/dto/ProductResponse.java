package com.ims.inventoryms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for product response data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    
    private Long id;
    private String name;
    private String description;
    private String sku;
    private String barcode;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private String unit;
    private String brand;
    private String supplier;
    private Long categoryId;
    private String categoryName;
    private Boolean isActive;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private Boolean isOverstocked;
    private BigDecimal profitMargin;
    private BigDecimal profitAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
