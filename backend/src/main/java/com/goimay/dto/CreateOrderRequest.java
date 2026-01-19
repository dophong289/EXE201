package com.goimay.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private String fullName;
    private String phone;
    private String address;
    private String email;
    private String note;
    private String paymentMethod; // COD | BANK
    private List<CreateOrderItemRequest> items;

    @Data
    public static class CreateOrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}

