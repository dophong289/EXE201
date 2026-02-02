package com.goimay.service;

import com.goimay.model.Role;
import com.goimay.model.User;
import com.goimay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    
    private final UserRepository userRepository;
    
    /**
     * Lấy danh sách users với phân trang và tìm kiếm
     */
    public Page<User> getUsers(String search, String roleStr, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Role role = null;
        if (roleStr != null && !roleStr.isEmpty()) {
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid role, ignore filter
            }
        }
        
        return userRepository.findBySearchAndRole(search, role, pageable);
    }
    
    /**
     * Lấy thông tin user theo ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
    }
    
    /**
     * Cập nhật role của user
     */
    @Transactional
    public User updateUserRole(Long userId, String newRoleStr) {
        User user = getUserById(userId);
        
        try {
            Role newRole = Role.valueOf(newRoleStr.toUpperCase());
            user.setRole(newRole);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + newRoleStr);
        }
    }
    
    /**
     * Xóa user (soft delete có thể implement sau)
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        
        // Không cho phép xóa chính mình hoặc admin khác
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Không thể xóa tài khoản Admin");
        }
        
        userRepository.delete(user);
    }
    
    /**
     * Thống kê số lượng users theo role
     */
    public long countByRole(Role role) {
        return userRepository.countByRole(role);
    }
    
    /**
     * Tổng số users
     */
    public long countAll() {
        return userRepository.count();
    }
}
