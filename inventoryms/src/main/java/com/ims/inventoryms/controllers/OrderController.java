package com.ims.inventoryms.controllers;

import com.ims.inventoryms.dto.OrderRequest;
import com.ims.inventoryms.dto.OrderResponse;
import com.ims.inventoryms.entity.Order;
import com.ims.inventoryms.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for order management endpoints
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * Get all orders (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {
        
        log.info("Fetching all orders with pagination: {}", pageable);
        
        Page<OrderResponse> orders = orderService.getAllOrders(pageable);
        
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get order by ID (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/orders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        log.info("Fetching order by ID: {}", id);
        
        OrderResponse order = orderService.getOrderById(id);
        
        return ResponseEntity.ok(order);
    }
    
    /**
     * Create new order (Sales/Manager/Admin only)
     */
    @PostMapping("/sales/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        log.info("Creating new order for customer: {}", orderRequest.getCustomerName());
        
        OrderResponse order = orderService.createOrder(orderRequest);
        
        log.info("Order created successfully with ID: {}", order.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    /**
     * Update order status (Sales/Manager/Admin only)
     */
    @PutMapping("/sales/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                          @RequestBody OrderStatusUpdateRequest statusRequest) {
        log.info("Updating order status for ID: {}", id);
        
        OrderResponse order = orderService.updateOrderStatus(id, statusRequest.getOrderStatus(), 
                statusRequest.getPaymentStatus(), statusRequest.getNotes());
        
        log.info("Order status updated successfully");
        
        return ResponseEntity.ok(order);
    }
    
    /**
     * Cancel order (Sales/Manager/Admin only)
     */
    @PutMapping("/sales/orders/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id,
                                                    @RequestBody(required = false) OrderCancellationRequest cancellationRequest) {
        log.info("Cancelling order with ID: {}", id);
        
        String reason = cancellationRequest != null ? cancellationRequest.getReason() : "No reason provided";
        OrderResponse order = orderService.cancelOrder(id, reason);
        
        log.info("Order cancelled successfully");
        
        return ResponseEntity.ok(order);
    }
    
    /**
     * Search orders (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/orders/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<Page<OrderResponse>> searchOrders(@RequestParam String search,
                                                           @PageableDefault(size = 10) Pageable pageable) {
        log.info("Searching orders with query: {}", search);
        
        Page<OrderResponse> orders = orderService.searchOrders(search, pageable);
        
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get orders by date range (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/orders/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {
        
        log.info("Fetching orders by date range: {} to {}", startDate, endDate);
        
        // Convert LocalDate to LocalDateTime (start of day and end of day)
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        Page<OrderResponse> orders = orderService.getOrdersByDateRange(startDateTime, endDateTime, pageable);
        
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get orders by status (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/orders/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(@PathVariable Order.OrderStatus status,
                                                                @PageableDefault(size = 10) Pageable pageable) {
        log.info("Fetching orders by status: {}", status);
        
        Page<OrderResponse> orders = orderService.getOrdersByStatus(status, pageable);
        
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get recent orders (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/orders/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<List<OrderResponse>> getRecentOrders() {
        log.info("Fetching recent orders");
        
        List<OrderResponse> orders = orderService.getRecentOrders(
                org.springframework.data.domain.PageRequest.of(0, 10));
        
        return ResponseEntity.ok(orders);
    }
    
    /**
     * DTO for order status update request
     */
    public static class OrderStatusUpdateRequest {
        private Order.OrderStatus orderStatus;
        private Order.PaymentStatus paymentStatus;
        private String notes;
        
        // Getters and setters
        public Order.OrderStatus getOrderStatus() { return orderStatus; }
        public void setOrderStatus(Order.OrderStatus orderStatus) { this.orderStatus = orderStatus; }
        
        public Order.PaymentStatus getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(Order.PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    /**
     * DTO for order cancellation request
     */
    public static class OrderCancellationRequest {
        private String reason;
        
        // Getters and setters
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
