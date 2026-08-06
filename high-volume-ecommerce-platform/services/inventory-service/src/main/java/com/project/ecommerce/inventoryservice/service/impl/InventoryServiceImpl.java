package com.project.ecommerce.inventoryservice.service.impl;

import com.project.ecommerce.inventoryservice.exception.InventoryNotFoundException;
import com.project.ecommerce.inventoryservice.dto.InventoryRequest;
import com.project.ecommerce.inventoryservice.dto.InventoryResponse;
import com.project.ecommerce.inventoryservice.entity.Inventory;
import com.project.ecommerce.inventoryservice.repository.InventoryRepository;
import com.project.ecommerce.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public InventoryResponse addInventory(InventoryRequest request) {

        Inventory inventory = Inventory.builder()
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .inStock(request.getQuantity() > 0)
                .build();

        Inventory savedInventory = inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }

    @Override
    public List<InventoryResponse> getAllInventory() {

        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public InventoryResponse getInventoryByProductId(Long productId) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new InventoryNotFoundException("Inventory not found for Product ID : " + productId));

        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse updateInventory(Long productId, InventoryRequest request) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new InventoryNotFoundException("Inventory not found for Product ID : " + productId));

        inventory.setQuantity(request.getQuantity());
        inventory.setInStock(request.getQuantity() > 0);

        Inventory updatedInventory = inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    public void deleteInventory(Long productId) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new InventoryNotFoundException("Inventory not found for Product ID : " + productId));

        inventoryRepository.delete(inventory);
    }

    private InventoryResponse mapToResponse(Inventory inventory) {

        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .inStock(inventory.getInStock())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }
}