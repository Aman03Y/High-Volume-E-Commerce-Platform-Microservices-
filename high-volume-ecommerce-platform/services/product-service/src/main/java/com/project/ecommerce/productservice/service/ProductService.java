package com.project.ecommerce.productservice.service;

import com.project.ecommerce.productservice.dto.ProductRequest;
import com.project.ecommerce.productservice.dto.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    List<ProductResponse> getAllProduct();

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}