package com.goimay.service;

import com.goimay.dto.SiteSettingDTO;
import com.goimay.model.SiteSetting;
import com.goimay.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteSettingService {
    
    private final SiteSettingRepository repository;
    
    public List<SiteSettingDTO> getAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<SiteSettingDTO> getByCategory(String category) {
        return repository.findByCategory(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Map<String, String> getSettingsMap() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(
                        SiteSetting::getSettingKey,
                        s -> s.getSettingValue() != null ? s.getSettingValue() : ""
                ));
    }
    
    public Map<String, String> getSettingsMapByCategory(String category) {
        return repository.findByCategory(category).stream()
                .collect(Collectors.toMap(
                        SiteSetting::getSettingKey,
                        s -> s.getSettingValue() != null ? s.getSettingValue() : ""
                ));
    }
    
    public SiteSettingDTO getByKey(String key) {
        return repository.findBySettingKey(key)
                .map(this::toDTO)
                .orElse(null);
    }
    
    public SiteSettingDTO save(SiteSettingDTO dto) {
        SiteSetting setting = repository.findBySettingKey(dto.getSettingKey())
                .orElse(new SiteSetting());
        
        setting.setSettingKey(dto.getSettingKey());
        setting.setSettingValue(dto.getSettingValue());
        setting.setDescription(dto.getDescription());
        setting.setCategory(dto.getCategory());
        
        return toDTO(repository.save(setting));
    }
    
    public void saveAll(List<SiteSettingDTO> settings) {
        for (SiteSettingDTO dto : settings) {
            save(dto);
        }
    }
    
    public void saveBulk(Map<String, String> settings, String category) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            SiteSetting setting = repository.findBySettingKey(entry.getKey())
                    .orElse(new SiteSetting());
            
            setting.setSettingKey(entry.getKey());
            setting.setSettingValue(entry.getValue());
            setting.setCategory(category);
            
            repository.save(setting);
        }
    }
    
    public void delete(Long id) {
        repository.deleteById(id);
    }
    
    private SiteSettingDTO toDTO(SiteSetting setting) {
        SiteSettingDTO dto = new SiteSettingDTO();
        dto.setId(setting.getId());
        dto.setSettingKey(setting.getSettingKey());
        dto.setSettingValue(setting.getSettingValue());
        dto.setDescription(setting.getDescription());
        dto.setCategory(setting.getCategory());
        return dto;
    }
    
    // Initialize default settings
    public void initializeDefaults() {
        // About page images
        saveDefault("about_story_image", "https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=600", "Ảnh câu chuyện thương hiệu", "about");
        saveDefault("about_artisan_image", "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600", "Ảnh nghệ nhân làng nghề", "about");
        saveDefault("about_material_1", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300", "Ảnh chất liệu - Mây tre đan", "about");
        saveDefault("about_material_2", "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300", "Ảnh chất liệu - Cói tự nhiên", "about");
        saveDefault("about_material_3", "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300", "Ảnh chất liệu - Gỗ tre", "about");
        saveDefault("about_material_4", "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=300", "Ảnh chất liệu - Lá chuối khô", "about");
        
        // Homepage images
        saveDefault("home_hero_bg", "", "Ảnh nền hero trang chủ", "homepage");
    }
    
    private void saveDefault(String key, String value, String description, String category) {
        if (!repository.existsBySettingKey(key)) {
            SiteSetting setting = new SiteSetting();
            setting.setSettingKey(key);
            setting.setSettingValue(value);
            setting.setDescription(description);
            setting.setCategory(category);
            repository.save(setting);
        }
    }
}
