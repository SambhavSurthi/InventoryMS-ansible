package com.ims.inventoryms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for product creation and update requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;
    
    @NotBlank(message = "Barcode is required")
    @Size(max = 100, message = "Barcode must not exceed 100 characters")
    private String barcode;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", message = "Cost price must be greater than or equal to 0")
    private BigDecimal costPrice;
    
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be greater than or equal to 0")
    private Integer stockQuantity = 0;
    
    @NotNull(message = "Minimum stock level is required")
    @Min(value = 0, message = "Minimum stock level must be greater than or equal to 0")
    private Integer minStockLevel = 0;
    
    @NotNull(message = "Maximum stock level is required")
    @Min(value = 1, message = "Maximum stock level must be greater than 0")
    private Integer maxStockLevel = 1000;
    
    @Size(max = 20, message = "Unit of measurement must not exceed 20 characters")
    private String unit;
    
    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;
    
    @Size(max = 100, message = "Supplier must not exceed 100 characters")
    private String supplier;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    private Boolean isActive = true;
}
