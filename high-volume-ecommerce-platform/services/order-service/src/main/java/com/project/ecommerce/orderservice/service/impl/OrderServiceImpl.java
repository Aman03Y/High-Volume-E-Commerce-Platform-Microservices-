package com.project.ecommerce.orderservice.service.impl;


import com.project.ecommerce.orderservice.dto.OrderRequest;
import com.project.ecommerce.orderservice.dto.OrderResponse;
import com.project.ecommerce.orderservice.entity.Order;
import com.project.ecommerce.orderservice.entity.OrderStatus;
import com.project.ecommerce.orderservice.exception.OrderNotFoundException;
import com.project.ecommerce.orderservice.repository.OrderRepository;
import com.project.ecommerce.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public OrderResponse createOrder(OrderRequest request) {

        BigDecimal totalPrice = request.getTotalPrice() != null ? request.getTotalPrice() : BigDecimal.valueOf(request.getQuantity() * 1000);

        String paymentStatus = "Payment Pending";
        if (request.getPaymentMethod() != null) {
            String method = request.getPaymentMethod().toLowerCase();
            if (method.contains("upi") || method.contains("card")) {
                paymentStatus = "Payment Successful";
            }
        }

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .name(request.getName())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(paymentStatus)
                .build();

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found with id : " + id));

        return mapToResponse(order);
    }

    @Override
    public OrderResponse updateOrder(Long id, OrderRequest request) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found with id : " + id));

        order.setCustomerId(request.getCustomerId());
        order.setProductId(request.getProductId());
        order.setQuantity(request.getQuantity());
        BigDecimal updatedTotalPrice = request.getTotalPrice() != null ? request.getTotalPrice() : BigDecimal.valueOf(request.getQuantity() * 1000);
        order.setTotalPrice(updatedTotalPrice);
        order.setName(request.getName());
        order.setAddress(request.getAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setPaymentMethod(request.getPaymentMethod());
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        String paymentStatus = "Payment Pending";
        if (request.getPaymentMethod() != null) {
            String method = request.getPaymentMethod().toLowerCase();
            if (method.contains("upi") || method.contains("card")) {
                paymentStatus = "Payment Successful";
            }
        }
        order.setPaymentStatus(paymentStatus);

        Order updatedOrder = orderRepository.save(order);

        return mapToResponse(updatedOrder);
    }

    @Override
    public void deleteOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new OrderNotFoundException("Order not found with id : " + id));

        orderRepository.delete(order);
    }

    private OrderResponse mapToResponse(Order order) {

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .productId(order.getProductId())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .name(order.getName())
                .address(order.getAddress())
                .phoneNumber(order.getPhoneNumber())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}