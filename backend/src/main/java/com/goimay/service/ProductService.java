package com.goimay.service;

import com.goimay.dto.ProductDTO;
import com.goimay.model.Product;
import com.goimay.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public Page<ProductDTO> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByActiveTrue(pageable).map(this::convertToDTO);
    }
    
    public Page<ProductDTO> getProductsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByProductCategoryAndActiveTrue(category, pageable)
                .map(this::convertToDTO);
    }
    
    public ProductDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found: " + slug));
        return convertToDTO(product);
    }
    
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return convertToDTO(product);
    }
    
    public List<ProductDTO> getSaleProducts() {
        return productRepository.findBySalePriceNotNullAndActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ProductDTO> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.searchProducts(keyword, pageable).map(this::convertToDTO);
    }
    
    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = new Product();
        updateProductFromDTO(product, dto);
        product.setActive(true);
        
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }
    
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        
        updateProductFromDTO(product, dto);
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    private void updateProductFromDTO(Product product, ProductDTO dto) {
        product.setName(dto.getName());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setSalePrice(dto.getSalePrice());
        product.setThumbnail(dto.getThumbnail());
        product.setProductCategory(dto.getProductCategory());
        product.setStock(dto.getStock());
        product.setActive(dto.isActive());
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setSalePrice(product.getSalePrice());
        dto.setThumbnail(product.getThumbnail());
        dto.setProductCategory(product.getProductCategory());
        dto.setStock(product.getStock());
        dto.setActive(product.isActive());
        return dto;
    }
}

