package com.goimay.controller;

import com.goimay.dto.MenuItemDTO;
import com.goimay.dto.MenuSetDTO;
import com.goimay.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MenuController {
    
    private final MenuService menuService;
    
    @GetMapping
    public ResponseEntity<List<MenuSetDTO>> getAllMenuSets() {
        return ResponseEntity.ok(menuService.getAllMenuSets());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MenuSetDTO> getMenuSetById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuSetById(id));
    }
    
    @PostMapping
    public ResponseEntity<MenuSetDTO> createMenuSet(@RequestBody MenuSetDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuService.createMenuSet(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MenuSetDTO> updateMenuSet(
            @PathVariable Long id,
            @RequestBody MenuSetDTO dto) {
        return ResponseEntity.ok(menuService.updateMenuSet(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuSet(@PathVariable Long id) {
        menuService.deleteMenuSet(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{setId}/items")
    public ResponseEntity<MenuItemDTO> addMenuItem(
            @PathVariable Long setId,
            @RequestBody MenuItemDTO itemDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuService.addMenuItem(setId, itemDTO));
    }
    
    @PutMapping("/items/{itemId}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable Long itemId,
            @RequestBody MenuItemDTO itemDTO) {
        return ResponseEntity.ok(menuService.updateMenuItem(itemId, itemDTO));
    }
    
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long itemId) {
        menuService.deleteMenuItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
