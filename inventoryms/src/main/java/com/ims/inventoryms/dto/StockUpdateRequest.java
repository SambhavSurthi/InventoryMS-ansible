package com.ims.inventoryms.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for stock update requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockUpdateRequest {
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    @NotNull(message = "Operation is required")
    private StockOperation operation;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    public enum StockOperation {
        ADD("Add stock"),
        SUBTRACT("Subtract stock"),
        SET("Set stock to specific value");
        
        private final String description;
        
        StockOperation(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
