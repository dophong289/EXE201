package com.goimay.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@goimay.com}")
    private String fromEmail;
    
    @Value("${app.name:Gói Mây}")
    private String appName;
    
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("Attempting to send OTP email to: {}", toEmail);
        log.info("Using from email: {}", fromEmail);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("[" + appName + "] Mã xác minh đặt lại mật khẩu");
            message.setText(
                "Xin chào,\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản " + appName + ".\n\n" +
                "Mã xác minh của bạn là: " + otp + "\n\n" +
                "Mã này sẽ hết hạn sau 5 phút.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ " + appName
            );
            
            mailSender.send(message);
            log.info("Password reset OTP sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
}
