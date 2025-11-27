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
 * DTO for sales dashboard response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardResponse {
    
    private BigDecimal totalSales;
    private long totalOrders;
    private long pendingOrders;
    private BigDecimal averageOrderValue;
    private int periodDays;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<OrderSummary> recentOrders;
    private List<DailySalesResponse> dailySales;
    private Map<String, Long> salesByPaymentMethod;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private Long id;
        private String orderNumber;
        private String customerName;
        private BigDecimal totalAmount;
        private com.ims.inventoryms.entity.Order.OrderStatus orderStatus;
        private com.ims.inventoryms.entity.Order.PaymentStatus paymentStatus;
        private LocalDateTime orderDate;
    }
}
