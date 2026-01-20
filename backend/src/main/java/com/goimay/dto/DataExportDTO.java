package com.goimay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataExportDTO {
    private List<SiteSettingDTO> siteSettings;
    private List<CategoryDTO> categories;
    private List<ProductCategoryDTO> productCategories;
    private List<ArticleDTO> articles;
    private List<ProductDTO> products;
}
