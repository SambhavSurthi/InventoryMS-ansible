package com.ims.inventoryms.dto;

import com.ims.inventoryms.entity.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for order creation requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    
    @NotBlank(message = "Customer name is required")
    @Size(max = 200, message = "Customer name must not exceed 200 characters")
    private String customerName;
    
    @Email(message = "Please provide a valid email address")
    @Size(max = 500, message = "Customer email must not exceed 500 characters")
    private String customerEmail;
    
    @Size(max = 15, message = "Customer phone must not exceed 15 characters")
    private String customerPhone;
    
    @Size(max = 500, message = "Shipping address must not exceed 500 characters")
    private String shippingAddress;
    
    @NotNull(message = "Payment method is required")
    private Order.PaymentMethod paymentMethod;
    
    @NotEmpty(message = "Order items are required")
    @Valid
    private List<OrderItemRequest> orderItems;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        
        @NotNull(message = "Product ID is required")
        private Long productId;
        
        @NotNull(message = "Quantity is required")
        private Integer quantity;
        
        @NotNull(message = "Price is required")
        private Double price;
        
        private Double discountAmount = 0.0;
        
        @Size(max = 500, message = "Notes must not exceed 500 characters")
        private String notes;
    }
}
