package com.goimay.service;

import com.goimay.dto.ArticleDTO;
import com.goimay.model.Article;
import com.goimay.model.Category;
import com.goimay.repository.ArticleRepository;
import com.goimay.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {
    
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    
    public Page<ArticleDTO> getAllArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        return articleRepository.findByPublishedTrue(pageable).map(this::convertToDTO);
    }
    
    public Page<ArticleDTO> getArticlesByCategory(String categorySlug, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        return articleRepository.findByCategorySlugAndPublishedTrue(categorySlug, pageable)
                .map(this::convertToDTO);
    }
    
    public ArticleDTO getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found: " + slug));
        return convertToDTO(article);
    }
    
    public ArticleDTO getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
        return convertToDTO(article);
    }
    
    public List<ArticleDTO> getFeaturedArticles() {
        return articleRepository.findByFeaturedTrueAndPublishedTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ArticleDTO> getLatestArticles(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return articleRepository.findLatestArticles(pageable)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ArticleDTO> searchArticles(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        return articleRepository.searchArticles(keyword, pageable).map(this::convertToDTO);
    }
    
    @Transactional
    public ArticleDTO createArticle(ArticleDTO dto) {
        Article article = new Article();
        updateArticleFromDTO(article, dto);
        article.setPublishedAt(LocalDateTime.now());
        article.setPublished(true);
        
        Article saved = articleRepository.save(article);
        return convertToDTO(saved);
    }
    
    @Transactional
    public ArticleDTO updateArticle(Long id, ArticleDTO dto) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
        
        updateArticleFromDTO(article, dto);
        Article saved = articleRepository.save(article);
        return convertToDTO(saved);
    }
    
    @Transactional
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
    
    private void updateArticleFromDTO(Article article, ArticleDTO dto) {
        article.setTitle(dto.getTitle());
        article.setSlug(dto.getSlug());
        article.setSummary(dto.getSummary());
        article.setContent(dto.getContent());
        article.setThumbnail(dto.getThumbnail());
        article.setAuthor(dto.getAuthor());
        article.setFeatured(dto.isFeatured());
        article.setPublished(dto.isPublished());
        
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + dto.getCategoryId()));
            article.setCategory(category);
        }
    }
    
    private ArticleDTO convertToDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setSummary(article.getSummary());
        dto.setContent(article.getContent());
        dto.setThumbnail(article.getThumbnail());
        dto.setAuthor(article.getAuthor());
        dto.setPublishedAt(article.getPublishedAt());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setFeatured(article.isFeatured());
        dto.setPublished(article.isPublished());
        
        if (article.getCategory() != null) {
            dto.setCategoryName(article.getCategory().getName());
            dto.setCategoryId(article.getCategory().getId());
        }
        
        return dto;
    }
}

