package com.goimay.controller;

import com.goimay.dto.ProductCategoryDTO;
import com.goimay.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-categories")
@RequiredArgsConstructor

public class ProductCategoryController {
    
    private final ProductCategoryService productCategoryService;
    
    @GetMapping
    public ResponseEntity<List<ProductCategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(productCategoryService.getAllCategories());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<ProductCategoryDTO>> getActiveCategories() {
        return ResponseEntity.ok(productCategoryService.getActiveCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductCategoryDTO> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(productCategoryService.getCategoryById(id));
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductCategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productCategoryService.getCategoryBySlug(slug));
    }
    
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody ProductCategoryDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productCategoryService.createCategory(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody ProductCategoryDTO dto) {
        try {
            return ResponseEntity.ok(productCategoryService.updateCategory(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            productCategoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
