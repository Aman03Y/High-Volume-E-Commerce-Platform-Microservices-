package com.project.ecommerce.inventoryservice.dto;


import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long id;

    private Long productId;

    private Integer quantity;

    private Boolean inStock;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}