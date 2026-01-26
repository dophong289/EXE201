package com.goimay.controller;

import com.goimay.dto.ArticleDTO;
import com.goimay.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ArticleController {
    
    private final ArticleService articleService;
    
    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(articleService.getAllArticles(page, size));
    }
    
    @GetMapping("/category/{categorySlug}")
    public ResponseEntity<Page<ArticleDTO>> getArticlesByCategory(
            @PathVariable String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(articleService.getArticlesByCategory(categorySlug, page, size));
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ArticleDTO> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getArticleBySlug(slug));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<ArticleDTO>> getFeaturedArticles() {
        return ResponseEntity.ok(articleService.getFeaturedArticles());
    }
    
    @GetMapping("/latest")
    public ResponseEntity<List<ArticleDTO>> getLatestArticles(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(articleService.getLatestArticles(limit));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ArticleDTO>> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(articleService.searchArticles(keyword, page, size));
    }
    
    @PostMapping
    public ResponseEntity<ArticleDTO> createArticle(@RequestBody ArticleDTO articleDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(articleService.createArticle(articleDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ArticleDTO> updateArticle(
            @PathVariable Long id,
            @RequestBody ArticleDTO articleDTO) {
        return ResponseEntity.ok(articleService.updateArticle(id, articleDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}

