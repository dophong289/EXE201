package com.goimay.repository;

import com.goimay.model.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {
    Optional<SiteSetting> findBySettingKey(String settingKey);
    List<SiteSetting> findByCategory(String category);
    boolean existsBySettingKey(String settingKey);
}
