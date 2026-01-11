package com.goimay.repository;

import com.goimay.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findBySlug(String slug);
    
    Page<Product> findByActiveTrue(Pageable pageable);
    
    Page<Product> findByProductCategoryAndActiveTrue(String category, Pageable pageable);
    
    List<Product> findBySalePriceNotNullAndActiveTrue();
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(String keyword, Pageable pageable);
}

