package com.project.ecommerce.orderservice.dto;

import com.project.ecommerce.orderservice.entity.OrderStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    @NotNull
    private Long customerId;

    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private BigDecimal totalPrice;

    private String name;

    private String address;

    private String phoneNumber;

    private String paymentMethod;

    private OrderStatus status;
}