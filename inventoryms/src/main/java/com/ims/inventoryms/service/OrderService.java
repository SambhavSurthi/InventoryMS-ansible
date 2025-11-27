package com.ims.inventoryms.service;

import com.ims.inventoryms.dto.OrderRequest;
import com.ims.inventoryms.dto.OrderResponse;
import com.ims.inventoryms.entity.*;
import com.ims.inventoryms.repository.OrderRepository;
import com.ims.inventoryms.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service class for order management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AuthService authService;
    
    /**
     * Get all orders with pagination
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(this::mapToOrderResponse);
    }
    
    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        return mapToOrderResponse(order);
    }
    
    /**
     * Create a new order
     */
    public OrderResponse createOrder(OrderRequest orderRequest) {
        User currentUser = authService.getCurrentUser();
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(currentUser);
        order.setCustomerName(orderRequest.getCustomerName());
        order.setCustomerEmail(orderRequest.getCustomerEmail());
        order.setCustomerPhone(orderRequest.getCustomerPhone());
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setNotes(orderRequest.getNotes());
        order.setOrderDate(LocalDateTime.now());
        
        // Calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        // Process order items and update stock
        for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getOrderItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemRequest.getProductId()));
            
            // Check stock availability
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(BigDecimal.valueOf(itemRequest.getPrice()));
            orderItem.setDiscountAmount(BigDecimal.valueOf(itemRequest.getDiscountAmount()));
            orderItem.setNotes(itemRequest.getNotes());
            
            order.addOrderItem(orderItem);
            
            // Update subtotal
            subtotal = subtotal.add(orderItem.getSubtotal());
            
            // Update stock
            product.updateStock(-itemRequest.getQuantity());
            productRepository.save(product);
        }
        
        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setDiscountAmount(discountAmount);
        order.calculateTotals();
        
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order created successfully: {}", savedOrder.getOrderNumber());
        
        return mapToOrderResponse(savedOrder);
    }
    
    /**
     * Update order status
     */
    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus orderStatus, 
                                          Order.PaymentStatus paymentStatus, String notes) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        
        order.setOrderStatus(orderStatus);
        order.setPaymentStatus(paymentStatus);
        if (notes != null && !notes.trim().isEmpty()) {
            order.setNotes(order.getNotes() + "\n" + notes);
        }
        
        // Set timestamps based on status
        if (orderStatus == Order.OrderStatus.SHIPPED && order.getShippedDate() == null) {
            order.setShippedDate(LocalDateTime.now());
        } else if (orderStatus == Order.OrderStatus.DELIVERED && order.getDeliveredDate() == null) {
            order.setDeliveredDate(LocalDateTime.now());
        }
        
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order status updated to {} for order: {}", orderStatus, savedOrder.getOrderNumber());
        
        return mapToOrderResponse(savedOrder);
    }
    
    /**
     * Cancel order
     */
    public OrderResponse cancelOrder(Long id, String reason) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        
        if (order.getOrderStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order is already cancelled");
        }
        
        if (order.getOrderStatus() == Order.OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel a delivered order");
        }
        
        // Restore stock for cancelled order
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.updateStock(orderItem.getQuantity());
            productRepository.save(product);
        }
        
        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            order.setNotes(order.getNotes() + "\nCancellation reason: " + reason);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order cancelled: {}", savedOrder.getOrderNumber());
        
        return mapToOrderResponse(savedOrder);
    }
    
    /**
     * Search orders
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> searchOrders(String search, Pageable pageable) {
        Page<Order> orders = orderRepository.searchOrders(search, pageable);
        return orders.map(this::mapToOrderResponse);
    }
    
    /**
     * Get orders by date range
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<Order> orders = orderRepository.findByOrderDateBetween(startDate, endDate, pageable);
        return orders.map(this::mapToOrderResponse);
    }
    
    /**
     * Get orders by status
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByOrderStatus(status, pageable);
        return orders.map(this::mapToOrderResponse);
    }
    
    /**
     * Get recent orders
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getRecentOrders(Pageable pageable) {
        List<Order> orders = orderRepository.findRecentOrders(pageable);
        return orders.stream().map(this::mapToOrderResponse).toList();
    }
    
    /**
     * Generate unique order number
     */
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Map Order entity to OrderResponse DTO
     */
    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .shippingAddress(order.getShippingAddress())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .orderDate(order.getOrderDate())
                .shippedDate(order.getShippedDate())
                .deliveredDate(order.getDeliveredDate())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(order.getOrderItems().stream().map(this::mapToOrderItemResponse).toList())
                .build();
    }
    
    /**
     * Map OrderItem entity to OrderItemResponse DTO
     */
    private OrderResponse.OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        return OrderResponse.OrderItemResponse.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProduct().getName())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .discountAmount(orderItem.getDiscountAmount())
                .subtotal(orderItem.getSubtotal())
                .totalAmount(orderItem.getTotalAmount())
                .notes(orderItem.getNotes())
                .build();
    }
}
