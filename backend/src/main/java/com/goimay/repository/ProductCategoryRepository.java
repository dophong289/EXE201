package com.goimay.repository;

import com.goimay.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    
    Optional<ProductCategory> findBySlug(String slug);
    
    Optional<ProductCategory> findByName(String name);
    
    List<ProductCategory> findByActiveOrderByDisplayOrderAsc(boolean active);
    
    List<ProductCategory> findAllByOrderByDisplayOrderAsc();
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
}
