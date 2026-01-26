package com.goimay.service;

import com.goimay.dto.MenuItemDTO;
import com.goimay.dto.MenuSetDTO;
import com.goimay.model.MenuItem;
import com.goimay.model.MenuSet;
import com.goimay.repository.MenuItemRepository;
import com.goimay.repository.MenuSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {
    
    private final MenuSetRepository menuSetRepository;
    private final MenuItemRepository menuItemRepository;
    
    public List<MenuSetDTO> getAllMenuSets() {
        return menuSetRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public MenuSetDTO getMenuSetById(Long id) {
        MenuSet menuSet = menuSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu set not found"));
        return toDTO(menuSet);
    }
    
    @Transactional
    public MenuSetDTO createMenuSet(MenuSetDTO dto) {
        MenuSet menuSet = new MenuSet();
        menuSet.setSetName(dto.getSetName());
        menuSet.setDisplayOrder((int) menuSetRepository.count());
        
        MenuSet saved = menuSetRepository.save(menuSet);
        
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (int i = 0; i < dto.getItems().size(); i++) {
                MenuItemDTO itemDTO = dto.getItems().get(i);
                MenuItem item = new MenuItem();
                item.setMenuSet(saved);
                item.setProduct(itemDTO.getProduct());
                item.setQuantity(itemDTO.getQuantity());
                item.setPrice(itemDTO.getPrice());
                item.setDisplayOrder(i);
                menuItemRepository.save(item);
            }
        }
        
        return toDTO(menuSetRepository.findById(saved.getId()).orElse(saved));
    }
    
    @Transactional
    public MenuSetDTO updateMenuSet(Long id, MenuSetDTO dto) {
        MenuSet menuSet = menuSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu set not found"));
        
        menuSet.setSetName(dto.getSetName());
        
        // Delete existing items
        menuItemRepository.deleteAll(menuSet.getItems());
        menuSet.getItems().clear();
        
        // Add new items
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (int i = 0; i < dto.getItems().size(); i++) {
                MenuItemDTO itemDTO = dto.getItems().get(i);
                MenuItem item = new MenuItem();
                item.setMenuSet(menuSet);
                item.setProduct(itemDTO.getProduct());
                item.setQuantity(itemDTO.getQuantity());
                item.setPrice(itemDTO.getPrice());
                item.setDisplayOrder(i);
                menuItemRepository.save(item);
            }
        }
        
        MenuSet saved = menuSetRepository.save(menuSet);
        return toDTO(menuSetRepository.findById(saved.getId()).orElse(saved));
    }
    
    @Transactional
    public void deleteMenuSet(Long id) {
        MenuSet menuSet = menuSetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu set not found"));
        menuSetRepository.delete(menuSet);
    }
    
    @Transactional
    public MenuItemDTO addMenuItem(Long setId, MenuItemDTO itemDTO) {
        MenuSet menuSet = menuSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Menu set not found"));
        
        MenuItem item = new MenuItem();
        item.setMenuSet(menuSet);
        item.setProduct(itemDTO.getProduct());
        item.setQuantity(itemDTO.getQuantity());
        item.setPrice(itemDTO.getPrice());
        item.setDisplayOrder(menuSet.getItems().size());
        
        MenuItem saved = menuItemRepository.save(item);
        return toItemDTO(saved);
    }
    
    @Transactional
    public MenuItemDTO updateMenuItem(Long itemId, MenuItemDTO itemDTO) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        item.setProduct(itemDTO.getProduct());
        item.setQuantity(itemDTO.getQuantity());
        item.setPrice(itemDTO.getPrice());
        
        MenuItem saved = menuItemRepository.save(item);
        return toItemDTO(saved);
    }
    
    @Transactional
    public void deleteMenuItem(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        menuItemRepository.delete(item);
    }
    
    private MenuSetDTO toDTO(MenuSet menuSet) {
        List<MenuItemDTO> items = menuSet.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());
        
        return new MenuSetDTO(
                menuSet.getId(),
                menuSet.getSetName(),
                items
        );
    }
    
    private MenuItemDTO toItemDTO(MenuItem item) {
        return new MenuItemDTO(
                item.getId(),
                item.getProduct(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
