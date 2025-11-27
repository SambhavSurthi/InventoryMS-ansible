package com.ims.inventoryms.controllers;

import com.ims.inventoryms.dto.*;
import com.ims.inventoryms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * REST controller for dashboard and analytics endpoints
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    /**
     * Get inventory dashboard (Manager/Admin only)
     */
    @GetMapping("/manager/dashboard/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InventoryDashboardResponse> getInventoryDashboard() {
        log.info("Fetching inventory dashboard data");
        
        InventoryDashboardResponse dashboard = dashboardService.getInventoryDashboard();
        
        return ResponseEntity.ok(dashboard);
    }
    
    /**
     * Get sales dashboard (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<SalesDashboardResponse> getSalesDashboard(
            @RequestParam(defaultValue = "30") int period) {
        log.info("Fetching sales dashboard data for period: {} days", period);
        
        SalesDashboardResponse dashboard = dashboardService.getSalesDashboard(period);
        
        return ResponseEntity.ok(dashboard);
    }
    
    /**
     * Get low stock alerts (Manager/Admin only)
     */
    @GetMapping("/manager/alerts/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LowStockAlertResponse> getLowStockAlerts() {
        log.info("Fetching low stock alerts");
        
        LowStockAlertResponse alerts = dashboardService.getLowStockAlerts();
        
        return ResponseEntity.ok(alerts);
    }
    
    /**
     * Get sales analytics (Sales/Manager/Admin only)
     */
    @GetMapping("/sales/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<SalesAnalyticsResponse> getSalesAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Fetching sales analytics from {} to {}", startDate, endDate);
        
        // Convert LocalDate to LocalDateTime (start of day and end of day)
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        SalesAnalyticsResponse analytics = dashboardService.getSalesAnalytics(startDateTime, endDateTime);
        
        return ResponseEntity.ok(analytics);
    }
}
