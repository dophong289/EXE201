package com.goimay.controller;

import com.goimay.dto.SiteSettingDTO;
import com.goimay.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site-settings")
@RequiredArgsConstructor
public class SiteSettingController {
    
    private final SiteSettingService service;
    
    @GetMapping
    public ResponseEntity<List<SiteSettingDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    
    @GetMapping("/map")
    public ResponseEntity<Map<String, String>> getSettingsMap() {
        return ResponseEntity.ok(service.getSettingsMap());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<SiteSettingDTO>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.getByCategory(category));
    }
    
    @GetMapping("/category/{category}/map")
    public ResponseEntity<Map<String, String>> getSettingsMapByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.getSettingsMapByCategory(category));
    }
    
    @GetMapping("/key/{key}")
    public ResponseEntity<SiteSettingDTO> getByKey(@PathVariable String key) {
        SiteSettingDTO setting = service.getByKey(key);
        if (setting == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(setting);
    }
    
    @PostMapping
    public ResponseEntity<SiteSettingDTO> save(@RequestBody SiteSettingDTO dto) {
        return ResponseEntity.ok(service.save(dto));
    }
    
    @PostMapping("/bulk")
    public ResponseEntity<Void> saveAll(@RequestBody List<SiteSettingDTO> settings) {
        service.saveAll(settings);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/bulk/{category}")
    public ResponseEntity<Void> saveBulk(@PathVariable String category, @RequestBody Map<String, String> settings) {
        service.saveBulk(settings, category);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/init")
    public ResponseEntity<Void> initializeDefaults() {
        service.initializeDefaults();
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
