package com.goimay.controller;

import com.goimay.dto.SiteSettingDTO;
import com.goimay.service.DataExportImportService;
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
    private final DataExportImportService dataExportImportService;
    
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
    public ResponseEntity<?> initializeDefaults() {
        try {
            service.initializeDefaults();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi khởi tạo mặc định: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Export dữ liệu site settings ra file JSON để commit vào git
     * Chỉ admin mới có thể gọi endpoint này
     */
    @PostMapping("/admin/sync")
    public ResponseEntity<Map<String, String>> syncToFile() {
        try {
            dataExportImportService.syncToFile();
            return ResponseEntity.ok(Map.of("message", "Đã đồng bộ dữ liệu vào file thành công. Vui lòng commit file data/site-settings.json vào git."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi đồng bộ dữ liệu: " + e.getMessage()));
        }
    }
    
    /**
     * Export tất cả dữ liệu (site settings, categories, products, articles) ra file JSON
     * Chỉ admin mới có thể gọi endpoint này
     */
    @PostMapping("/admin/sync-all")
    public ResponseEntity<Map<String, String>> syncAllToFile() {
        try {
            dataExportImportService.syncAllToFile();
            return ResponseEntity.ok(Map.of("message", "Đã đồng bộ tất cả dữ liệu vào file thành công. Vui lòng commit các file trong thư mục data/ và uploads/ vào git."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi đồng bộ dữ liệu: " + e.getMessage()));
        }
    }
}
