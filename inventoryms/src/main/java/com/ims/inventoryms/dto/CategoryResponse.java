package com.ims.inventoryms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for category response data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    
    private Long id;
    private String name;
    private String description;
    private Long parentCategoryId;
    private String parentCategoryName;
    private List<CategoryResponse> subCategories;
    private Long productCount;
    private Boolean isActive;
    private Boolean hasParent;
    private Boolean hasSubCategories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
