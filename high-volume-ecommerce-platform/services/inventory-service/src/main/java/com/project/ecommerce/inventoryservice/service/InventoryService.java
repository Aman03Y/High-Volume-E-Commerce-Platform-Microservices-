package com.project.ecommerce.inventoryservice.service;

import com.project.ecommerce.inventoryservice.dto.InventoryRequest;
import com.project.ecommerce.inventoryservice.dto.InventoryResponse;

import java.util.List;

public interface InventoryService {

    InventoryResponse addInventory(InventoryRequest request);

    List<InventoryResponse> getAllInventory();

    InventoryResponse getInventoryByProductId(Long productId);

    InventoryResponse updateInventory(Long productId, InventoryRequest request);

    void deleteInventory(Long productId);
}
