package com.goimay.service;

import com.goimay.dto.ProductCategoryDTO;
import com.goimay.model.ProductCategory;
import com.goimay.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {
    
    private final ProductCategoryRepository productCategoryRepository;
    
    public List<ProductCategoryDTO> getAllCategories() {
        return productCategoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<ProductCategoryDTO> getActiveCategories() {
        return productCategoryRepository.findByActiveOrderByDisplayOrderAsc(true)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public ProductCategoryDTO getCategoryById(Long id) {
        return productCategoryRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
    }
    
    public ProductCategoryDTO getCategoryBySlug(String slug) {
        return productCategoryRepository.findBySlug(slug)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
    }
    
    public ProductCategoryDTO createCategory(ProductCategoryDTO dto) {
        if (productCategoryRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        
        ProductCategory category = new ProductCategory();
        category.setName(dto.getName());
        category.setSlug(dto.getSlug() != null ? dto.getSlug() : generateSlug(dto.getName()));
        category.setDescription(dto.getDescription());
        category.setIcon(dto.getIcon());
        category.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        category.setActive(dto.isActive());
        
        return toDTO(productCategoryRepository.save(category));
    }
    
    public ProductCategoryDTO updateCategory(Long id, ProductCategoryDTO dto) {
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        
        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        category.setIcon(dto.getIcon());
        category.setDisplayOrder(dto.getDisplayOrder());
        category.setActive(dto.isActive());
        
        return toDTO(productCategoryRepository.save(category));
    }
    
    public void deleteCategory(Long id) {
        if (!productCategoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục");
        }
        productCategoryRepository.deleteById(id);
    }
    
    private ProductCategoryDTO toDTO(ProductCategory category) {
        return new ProductCategoryDTO(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                category.getDisplayOrder(),
                category.isActive()
        );
    }
    
    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
