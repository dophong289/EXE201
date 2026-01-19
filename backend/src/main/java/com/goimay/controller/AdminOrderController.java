package com.goimay.controller;

import com.goimay.dto.OrderDTO;
import com.goimay.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAll() {
        return ResponseEntity.ok(orderService.adminGetAllOrders());
    }

    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<OrderDTO> confirm(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.adminConfirm(orderId));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancel(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.adminCancel(orderId));
    }
}

