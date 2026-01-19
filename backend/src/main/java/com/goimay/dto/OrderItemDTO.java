package com.goimay.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemDTO {
    private Long productId;
    private String name;
    private String slug;
    private String thumbnail;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
}

