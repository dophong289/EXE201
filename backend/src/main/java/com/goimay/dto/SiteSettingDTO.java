package com.goimay.dto;

import lombok.Data;

@Data
public class SiteSettingDTO {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String description;
    private String category;
}
