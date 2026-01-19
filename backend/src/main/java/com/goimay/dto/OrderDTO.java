package com.goimay.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderDTO {
    private String id;
    private String status;
    private String paymentMethod;

    private String fullName;
    private String phone;
    private String address;
    private String email;
    private String note;

    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal total;

    private String createdAt;
    private String updatedAt;

    private List<OrderItemDTO> items;
}

