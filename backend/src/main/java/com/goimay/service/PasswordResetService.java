package com.goimay.service;

import com.goimay.model.PasswordResetToken;
import com.goimay.model.User;
import com.goimay.repository.PasswordResetTokenRepository;
import com.goimay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    
    @Transactional
    public void sendPasswordResetOtp(String email) {
        log.info("=== Password reset requested for email: {} ===", email);
        
        // Check if user exists
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            log.warn("User NOT FOUND in database for email: {}", email);
            return;
        }
        
        log.info("User FOUND in database: {} (id={})", user.getEmail(), user.getId());
        
        // Delete any existing tokens for this email
        tokenRepository.deleteByEmail(email);
        log.info("Deleted existing tokens for email: {}", email);
        
        // Generate OTP
        String otp = generateOtp();
        String resetToken = UUID.randomUUID().toString();
        log.info("Generated OTP: {} for email: {}", otp, email);
        
        // Save token
        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .resetToken(resetToken)
                .expiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .otpVerified(false)
                .build();
        
        tokenRepository.save(token);
        log.info("Token saved to database for email: {}", email);
        
        // Send email
        log.info("Calling EmailService to send OTP...");
        emailService.sendPasswordResetOtp(email, otp);
        log.info("EmailService call completed for email: {}", email);
    }
    
    @Transactional
    public String verifyOtp(String email, String otp) {
        PasswordResetToken token = tokenRepository
                .findByEmailAndOtpAndOtpVerifiedFalse(email, otp)
                .orElseThrow(() -> new RuntimeException("Mã xác minh không đúng"));
        
        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new RuntimeException("Mã xác minh đã hết hạn");
        }
        
        // Mark OTP as verified
        token.setOtpVerified(true);
        // Extend expiry for reset step (10 more minutes)
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        tokenRepository.save(token);
        
        return token.getResetToken();
    }
    
    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        PasswordResetToken token = tokenRepository
                .findByResetTokenAndOtpVerifiedTrue(resetToken)
                .orElseThrow(() -> new RuntimeException("Link đặt lại mật khẩu không hợp lệ"));
        
        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new RuntimeException("Link đặt lại mật khẩu đã hết hạn");
        }
        
        User user = userRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Delete used token
        tokenRepository.delete(token);
    }
    
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
