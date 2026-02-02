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

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        java.time.LocalDate start = startDate != null ? java.time.LocalDate.parse(startDate) : null;
        java.time.LocalDate end = endDate != null ? java.time.LocalDate.parse(endDate) : null;
        return ResponseEntity.ok(orderService.getOrderStats(start, end));
    }
}

