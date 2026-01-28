package com.goimay.controller;

import com.goimay.dto.*;
import com.goimay.service.AuthService;
import com.goimay.service.PasswordResetService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    
    @Value("${app.cookie.secure:true}")
    private boolean secureCookie;
    
    private static final String JWT_COOKIE_NAME = "jwt";
    private static final int COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
    
    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/api");
        cookie.setMaxAge(COOKIE_MAX_AGE);
        // SameSite is set via response header since Cookie class doesn't support it directly
        response.addCookie(cookie);
        response.setHeader("Set-Cookie", 
            String.format("%s=%s; Path=/api; Max-Age=%d; HttpOnly; %sSameSite=Lax",
                JWT_COOKIE_NAME, token, COOKIE_MAX_AGE, secureCookie ? "Secure; " : ""));
    }
    
    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/api");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        response.setHeader("Set-Cookie", 
            String.format("%s=; Path=/api; Max-Age=0; HttpOnly; %sSameSite=Lax",
                JWT_COOKIE_NAME, secureCookie ? "Secure; " : ""));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.register(request);
            setJwtCookie(response, authResponse.getToken());
            // Return user info without token in body (token is in cookie)
            return ResponseEntity.ok(Map.of(
                "id", authResponse.getId(),
                "fullName", authResponse.getFullName(),
                "email", authResponse.getEmail(),
                "role", authResponse.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);
            setJwtCookie(response, authResponse.getToken());
            // Return user info without token in body (token is in cookie)
            return ResponseEntity.ok(Map.of(
                "id", authResponse.getId(),
                "fullName", authResponse.getFullName(),
                "email", authResponse.getEmail(),
                "role", authResponse.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.loginWithGoogle(request);
            setJwtCookie(response, authResponse.getToken());
            // Return user info without token in body (token is in cookie)
            return ResponseEntity.ok(Map.of(
                "id", authResponse.getId(),
                "fullName", authResponse.getFullName(),
                "email", authResponse.getEmail(),
                "role", authResponse.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        clearJwtCookie(response);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        return ResponseEntity.ok(Map.of("message", "Authenticated"));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info(">>> FORGOT PASSWORD ENDPOINT CALLED for email: {}", request.getEmail());
        try {
            passwordResetService.sendPasswordResetOtp(request.getEmail());
            log.info(">>> FORGOT PASSWORD completed for email: {}", request.getEmail());
            // Always return success to not reveal if email exists
            return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, mã xác minh đã được gửi"));
        } catch (Exception e) {
            log.error(">>> FORGOT PASSWORD error: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, mã xác minh đã được gửi"));
        }
    }
    
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            String resetToken = passwordResetService.verifyOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(Map.of("token", resetToken));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

