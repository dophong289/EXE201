package com.goimay.controller;

import com.goimay.model.Role;
import com.goimay.model.User;
import com.goimay.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    
    private final AdminUserService adminUserService;
    
    /**
     * Lấy danh sách users với phân trang và tìm kiếm
     * GET /api/admin/users?search=abc&role=USER&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<User> usersPage = adminUserService.getUsers(search, role, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", usersPage.getContent().stream().map(this::toUserDTO).toList());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("hasNext", usersPage.hasNext());
        response.put("hasPrevious", usersPage.hasPrevious());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy thông tin chi tiết user
     * GET /api/admin/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        User user = adminUserService.getUserById(id);
        return ResponseEntity.ok(toUserDTO(user));
    }
    
    /**
     * Cập nhật role của user
     * PUT /api/admin/users/{id}/role
     * Body: { "role": "MANAGER" }
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role không được để trống"));
        }
        
        try {
            User updatedUser = adminUserService.updateUserRole(id, newRole);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật quyền thành công");
            response.put("user", toUserDTO(updatedUser));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Xóa user
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        try {
            adminUserService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * Thống kê users
     * GET /api/admin/users/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", adminUserService.countAll());
        stats.put("users", adminUserService.countByRole(Role.USER));
        stats.put("managers", adminUserService.countByRole(Role.MANAGER));
        stats.put("admins", adminUserService.countByRole(Role.ADMIN));
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Lấy danh sách roles có sẵn
     * GET /api/admin/users/roles
     */
    @GetMapping("/roles")
    public ResponseEntity<String[]> getRoles() {
        return ResponseEntity.ok(new String[]{"USER", "MANAGER", "ADMIN"});
    }
    
    /**
     * Convert User entity to DTO (hide sensitive data)
     */
    private Map<String, Object> toUserDTO(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("fullName", user.getFullName());
        dto.put("email", user.getEmail());
        dto.put("phone", user.getPhone());
        dto.put("role", user.getRole().name());
        dto.put("enabled", user.isEnabled());
        dto.put("provider", user.getProvider());
        dto.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return dto;
    }
}
