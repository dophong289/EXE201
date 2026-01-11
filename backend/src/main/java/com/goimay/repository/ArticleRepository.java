package com.goimay.repository;

import com.goimay.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    Optional<Article> findBySlug(String slug);
    
    Page<Article> findByPublishedTrue(Pageable pageable);
    
    Page<Article> findByCategoryIdAndPublishedTrue(Long categoryId, Pageable pageable);
    
    Page<Article> findByCategorySlugAndPublishedTrue(String categorySlug, Pageable pageable);
    
    List<Article> findByFeaturedTrueAndPublishedTrue();
    
    @Query("SELECT a FROM Article a WHERE a.published = true ORDER BY a.publishedAt DESC")
    List<Article> findLatestArticles(Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.published = true AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Article> searchArticles(String keyword, Pageable pageable);
}

