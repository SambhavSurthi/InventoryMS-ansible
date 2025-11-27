package com.ims.inventoryms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for low stock alert response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockAlertResponse {
    
    private long lowStockCount;
    private long outOfStockCount;
    private List<InventoryDashboardResponse.ProductSummary> lowStockProducts;
    private List<InventoryDashboardResponse.ProductSummary> outOfStockProducts;
}
