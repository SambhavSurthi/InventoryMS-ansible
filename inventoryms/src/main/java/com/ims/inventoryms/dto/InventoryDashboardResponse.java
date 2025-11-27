package com.ims.inventoryms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for inventory dashboard response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDashboardResponse {
    
    private long totalProducts;
    private long activeProducts;
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal totalInventoryValue;
    private List<ProductSummary> lowStockProducts;
    private List<ProductSummary> outOfStockProducts;
    private List<ProductSummary> topSellingProducts;
    private List<ProductSummary> recentlyAddedProducts;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSummary {
        private Long id;
        private String name;
        private String sku;
        private Integer stockQuantity;
        private Integer minStockLevel;
        private Integer maxStockLevel;
        private BigDecimal price;
        private BigDecimal costPrice;
        private Boolean isLowStock;
        private Boolean isOutOfStock;
    }
}
