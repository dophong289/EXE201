package com.goimay.repository;

import com.goimay.model.Product;
import com.goimay.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductOrderByDisplayOrderAscIdAsc(Product product);
    void deleteByProduct(Product product);
}

