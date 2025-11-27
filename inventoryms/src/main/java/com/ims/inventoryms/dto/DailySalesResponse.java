package com.ims.inventoryms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for daily sales response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesResponse {
    
    private LocalDate date;
    private BigDecimal sales;
}
