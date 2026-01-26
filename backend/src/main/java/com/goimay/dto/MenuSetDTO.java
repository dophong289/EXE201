package com.goimay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuSetDTO {
    private Long id;
    private String setName;
    private List<MenuItemDTO> items;
}
