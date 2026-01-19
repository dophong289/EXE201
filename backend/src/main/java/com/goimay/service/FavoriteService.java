package com.goimay.service;

import com.goimay.dto.ProductDTO;
import com.goimay.model.Favorite;
import com.goimay.model.Product;
import com.goimay.model.User;
import com.goimay.repository.FavoriteRepository;
import com.goimay.repository.ProductRepository;
import com.goimay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    public List<ProductDTO> getFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(f -> toProductDTO(f.getProduct()))
                .collect(Collectors.toList());
    }
    
    public List<Long> getFavoriteProductIds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(f -> f.getProduct().getId())
                .collect(Collectors.toList());
    }
    
    @Transactional
    public boolean toggleFavorite(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (favoriteRepository.existsByUserAndProduct(user, product)) {
            favoriteRepository.deleteByUserAndProduct(user, product);
            return false; // Removed from favorites
        } else {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setProduct(product);
            favoriteRepository.save(favorite);
            return true; // Added to favorites
        }
    }
    
    public boolean isFavorite(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return favoriteRepository.existsByUserAndProduct(user, product);
    }
    
    public long getFavoriteCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return favoriteRepository.countByUser(user);
    }
    
    private ProductDTO toProductDTO(Product product) {
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
