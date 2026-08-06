package com.project.ecommerce.inventoryservice.exception;


public class InventoryNotFoundException extends RuntimeException {

    public InventoryNotFoundException(String message) {
        super(message);
    }
}