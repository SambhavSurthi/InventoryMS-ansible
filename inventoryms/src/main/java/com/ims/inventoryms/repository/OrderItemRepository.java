package com.ims.inventoryms.repository;

import com.ims.inventoryms.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for OrderItem entity operations
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Find order items by order
     */
    List<OrderItem> findByOrderId(Long orderId);
    
    /**
     * Find order items by product
     */
    List<OrderItem> findByProductId(Long productId);
    
    /**
     * Find order items by order and product
     */
    List<OrderItem> findByOrderIdAndProductId(Long orderId, Long productId);
    
    /**
     * Calculate total quantity sold for a product
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product.id = :productId")
    Integer calculateTotalQuantitySold(@Param("productId") Long productId);
    
    /**
     * Calculate total revenue for a product
     */
    @Query("SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM OrderItem oi WHERE oi.product.id = :productId")
    Double calculateTotalRevenueForProduct(@Param("productId") Long productId);
    
    /**
     * Find top selling products by quantity
     */
    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItem oi " +
           "GROUP BY oi.product.id " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findTopSellingProductsByQuantity();
    
    /**
     * Find top selling products by revenue
     */
    @Query("SELECT oi.product.id, SUM(oi.price * oi.quantity) as totalRevenue " +
           "FROM OrderItem oi " +
           "GROUP BY oi.product.id " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findTopSellingProductsByRevenue();
}
