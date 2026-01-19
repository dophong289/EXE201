package com.goimay.controller;

import com.goimay.dto.CreateOrderRequest;
import com.goimay.dto.OrderDTO;
import com.goimay.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDTO> create(Authentication authentication, @RequestBody CreateOrderRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.createOrder(email, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO>> myOrders(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.getMyOrders(email));
    }

    @GetMapping("/my/{orderId}")
    public ResponseEntity<OrderDTO> myOrderById(Authentication authentication, @PathVariable String orderId) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.getMyOrderById(email, orderId));
    }

    @PutMapping("/my/{orderId}/received")
    public ResponseEntity<OrderDTO> markReceived(Authentication authentication, @PathVariable String orderId) {
        String email = authentication.getName();
        return ResponseEntity.ok(orderService.markReceived(email, orderId));
    }
}

