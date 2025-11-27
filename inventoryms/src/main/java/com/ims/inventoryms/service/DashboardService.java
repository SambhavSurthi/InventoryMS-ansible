package com.ims.inventoryms.service;

import com.ims.inventoryms.dto.*;
import com.ims.inventoryms.entity.Product;
import com.ims.inventoryms.repository.OrderRepository;
import com.ims.inventoryms.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service class for dashboard and analytics operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {
    
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    
    /**
     * Get inventory dashboard data
     */
    public InventoryDashboardResponse getInventoryDashboard() {
        // Get low stock products
        List<Product> lowStockProducts = productRepository.findLowStockProducts();
        List<Product> outOfStockProducts = productRepository.findOutOfStockProducts();
        
        // Calculate inventory metrics
        long totalProducts = productRepository.count();
        long lowStockCount = lowStockProducts.size();
        long outOfStockCount = outOfStockProducts.size();
        long activeProducts = productRepository.findActiveProducts(org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        
        // Calculate total inventory value
        BigDecimal totalInventoryValue = productRepository.findAll().stream()
                .filter(Product::getIsActive)
                .map(p -> p.getCostPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get top selling products
        List<Product> topSellingProducts = productRepository.findTopSellingProducts(
                org.springframework.data.domain.PageRequest.of(0, 5));
        
        // Get recently added products
        List<Product> recentlyAddedProducts = productRepository.findRecentlyAddedProducts(
                org.springframework.data.domain.PageRequest.of(0, 5));
        
        return InventoryDashboardResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .totalInventoryValue(totalInventoryValue)
                .lowStockProducts(lowStockProducts.stream().map(this::mapToProductSummary).toList())
                .outOfStockProducts(outOfStockProducts.stream().map(this::mapToProductSummary).toList())
                .topSellingProducts(topSellingProducts.stream().map(this::mapToProductSummary).toList())
                .recentlyAddedProducts(recentlyAddedProducts.stream().map(this::mapToProductSummary).toList())
                .build();
    }
    
    /**
     * Get sales dashboard data
     */
    public SalesDashboardResponse getSalesDashboard(int periodDays) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minus(periodDays, ChronoUnit.DAYS);
        
        // Calculate sales metrics
        BigDecimal totalSales = orderRepository.calculateTotalSales(startDate, endDate);
        long totalOrders = orderRepository.findCompletedOrders(org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long pendingOrders = orderRepository.countByOrderStatus(com.ims.inventoryms.entity.Order.OrderStatus.PENDING);
        
        // Get recent orders
        List<com.ims.inventoryms.entity.Order> recentOrders = orderRepository.findRecentOrders(
                org.springframework.data.domain.PageRequest.of(0, 10));
        
        // Calculate daily sales for chart
        List<DailySalesResponse> dailySales = calculateDailySales(startDate, endDate);
        
        // Calculate sales by payment method
        Map<String, Long> salesByPaymentMethod = calculateSalesByPaymentMethod();
        
        // Calculate average order value
        BigDecimal averageOrderValue = totalOrders > 0 ? 
                totalSales.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        
        return SalesDashboardResponse.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .averageOrderValue(averageOrderValue)
                .periodDays(periodDays)
                .startDate(startDate)
                .endDate(endDate)
                .recentOrders(recentOrders.stream().map(this::mapToOrderSummary).toList())
                .dailySales(dailySales)
                .salesByPaymentMethod(salesByPaymentMethod)
                .build();
    }
    
    /**
     * Get low stock alerts
     */
    public LowStockAlertResponse getLowStockAlerts() {
        List<Product> lowStockProducts = productRepository.findLowStockProducts();
        List<Product> outOfStockProducts = productRepository.findOutOfStockProducts();
        
        return LowStockAlertResponse.builder()
                .lowStockCount(lowStockProducts.size())
                .outOfStockCount(outOfStockProducts.size())
                .lowStockProducts(lowStockProducts.stream().map(this::mapToProductSummary).toList())
                .outOfStockProducts(outOfStockProducts.stream().map(this::mapToProductSummary).toList())
                .build();
    }
    
    /**
     * Get sales analytics
     */
    public SalesAnalyticsResponse getSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        // Calculate total sales
        BigDecimal totalSales = orderRepository.calculateTotalSales(startDate, endDate);
        
        // Get orders in date range
        List<com.ims.inventoryms.entity.Order> orders = orderRepository.findByOrderDateBetween(
                startDate, endDate, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        // Calculate metrics
        long totalOrders = orders.size();
        BigDecimal averageOrderValue = totalOrders > 0 ? 
                totalSales.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        
        // Calculate daily sales
        List<DailySalesResponse> dailySales = calculateDailySales(startDate, endDate);
        
        // Calculate sales by status
        Map<String, Long> salesByStatus = new HashMap<>();
        for (com.ims.inventoryms.entity.Order order : orders) {
            String status = order.getOrderStatus().name();
            salesByStatus.put(status, salesByStatus.getOrDefault(status, 0L) + 1);
        }
        
        return SalesAnalyticsResponse.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .averageOrderValue(averageOrderValue)
                .startDate(startDate)
                .endDate(endDate)
                .dailySales(dailySales)
                .salesByStatus(salesByStatus)
                .build();
    }
    
    /**
     * Calculate daily sales for a date range
     */
    private List<DailySalesResponse> calculateDailySales(LocalDateTime startDate, LocalDateTime endDate) {
        List<DailySalesResponse> dailySales = new ArrayList<>();
        
        LocalDateTime currentDate = startDate.toLocalDate().atStartOfDay();
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime dayStart = currentDate;
            LocalDateTime dayEnd = currentDate.plusDays(1).minusSeconds(1);
            
            BigDecimal daySales = orderRepository.calculateTotalSales(dayStart, dayEnd);
            
            dailySales.add(DailySalesResponse.builder()
                    .date(dayStart.toLocalDate())
                    .sales(daySales)
                    .build());
            
            currentDate = currentDate.plusDays(1);
        }
        
        return dailySales;
    }
    
    /**
     * Calculate sales by payment method
     */
    private Map<String, Long> calculateSalesByPaymentMethod() {
        Map<String, Long> salesByPaymentMethod = new HashMap<>();
        
        for (com.ims.inventoryms.entity.Order.PaymentMethod method : com.ims.inventoryms.entity.Order.PaymentMethod.values()) {
            long count = orderRepository.findByPaymentMethod(method, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
            if (count > 0) {
                salesByPaymentMethod.put(method.getDisplayName(), count);
            }
        }
        
        return salesByPaymentMethod;
    }
    
    /**
     * Map Product entity to ProductSummary DTO
     */
    private InventoryDashboardResponse.ProductSummary mapToProductSummary(Product product) {
        return InventoryDashboardResponse.ProductSummary.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .minStockLevel(product.getMinStockLevel())
                .maxStockLevel(product.getMaxStockLevel())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .isLowStock(product.isLowStock())
                .isOutOfStock(product.isOutOfStock())
                .build();
    }
    
    /**
     * Map Order entity to OrderSummary DTO
     */
    private SalesDashboardResponse.OrderSummary mapToOrderSummary(com.ims.inventoryms.entity.Order order) {
        return SalesDashboardResponse.OrderSummary.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .orderDate(order.getOrderDate())
                .build();
    }
}
