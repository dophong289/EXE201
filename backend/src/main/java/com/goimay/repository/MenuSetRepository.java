package com.goimay.repository;

import com.goimay.model.MenuSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuSetRepository extends JpaRepository<MenuSet, Long> {
    List<MenuSet> findAllByOrderByDisplayOrderAscIdAsc();
}
