package com.ims.inventoryms.repository;

import com.ims.inventoryms.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Order entity operations
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find order by order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * Check if order number exists
     */
    boolean existsByOrderNumber(String orderNumber);
    
    /**
     * Find orders by user
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId")
    Page<Order> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Find orders by status
     */
    @Query("SELECT o FROM Order o WHERE o.orderStatus = :status")
    Page<Order> findByOrderStatus(@Param("status") Order.OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by payment status
     */
    @Query("SELECT o FROM Order o WHERE o.paymentStatus = :status")
    Page<Order> findByPaymentStatus(@Param("status") Order.PaymentStatus status, Pageable pageable);
    
    /**
     * Find orders by date range
     */
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    Page<Order> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate, 
                                       Pageable pageable);
    
    /**
     * Find orders by customer email
     */
    @Query("SELECT o FROM Order o WHERE LOWER(o.customerEmail) = LOWER(:email)")
    Page<Order> findByCustomerEmail(@Param("email") String email, Pageable pageable);
    
    /**
     * Find orders by customer phone
     */
    @Query("SELECT o FROM Order o WHERE o.customerPhone = :phone")
    Page<Order> findByCustomerPhone(@Param("phone") String phone, Pageable pageable);
    
    /**
     * Search orders by customer name or order number
     */
    @Query("SELECT o FROM Order o WHERE " +
           "(LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> searchOrders(@Param("search") String search, Pageable pageable);
    
    /**
     * Find orders by total amount range
     */
    @Query("SELECT o FROM Order o WHERE o.totalAmount BETWEEN :minAmount AND :maxAmount")
    Page<Order> findByTotalAmountBetween(@Param("minAmount") BigDecimal minAmount, 
                                         @Param("maxAmount") BigDecimal maxAmount, 
                                         Pageable pageable);
    
    /**
     * Find completed orders
     */
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'DELIVERED' AND o.paymentStatus = 'PAID'")
    Page<Order> findCompletedOrders(Pageable pageable);
    
    /**
     * Find pending orders
     */
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'PENDING'")
    List<Order> findPendingOrders();
    
    /**
     * Find orders by payment method
     */
    @Query("SELECT o FROM Order o WHERE o.paymentMethod = :method")
    Page<Order> findByPaymentMethod(@Param("method") Order.PaymentMethod method, Pageable pageable);
    
    /**
     * Calculate total sales amount
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE " +
           "o.orderStatus = 'DELIVERED' AND o.paymentStatus = 'PAID' AND " +
           "o.orderDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalSales(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count orders by status
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = :status")
    long countByOrderStatus(@Param("status") Order.OrderStatus status);
    
    /**
     * Find recent orders
     */
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findRecentOrders(Pageable pageable);
    
    /**
     * Find orders by user and date range
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND " +
           "o.orderDate BETWEEN :startDate AND :endDate")
    Page<Order> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                         @Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate, 
                                         Pageable pageable);
}
