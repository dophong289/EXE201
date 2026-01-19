package com.goimay.controller;

import com.goimay.dto.ProductDTO;
import com.goimay.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getFavorites(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteService.getFavorites(email));
    }
    
    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(favoriteService.getFavoriteProductIds(email));
    }
    
    @PostMapping("/toggle/{productId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            Authentication authentication,
            @PathVariable Long productId) {
        String email = authentication.getName();
        boolean isFavorite = favoriteService.toggleFavorite(email, productId);
        return ResponseEntity.ok(Map.of(
                "isFavorite", isFavorite,
                "message", isFavorite ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích"
        ));
    }
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            Authentication authentication,
            @PathVariable Long productId) {
        String email = authentication.getName();
        boolean isFavorite = favoriteService.isFavorite(email, productId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getFavoriteCount(Authentication authentication) {
        String email = authentication.getName();
        long count = favoriteService.getFavoriteCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
