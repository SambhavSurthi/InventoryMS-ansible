package com.ims.inventoryms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for sales analytics response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesAnalyticsResponse {
    
    private BigDecimal totalSales;
    private long totalOrders;
    private BigDecimal averageOrderValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<DailySalesResponse> dailySales;
    private Map<String, Long> salesByStatus;
}
