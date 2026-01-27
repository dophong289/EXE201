package com.goimay.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailService {
    
    @Value("${SENDGRID_API_KEY:${MAIL_PASSWORD:}}")
    private String sendGridApiKey;
    
    @Value("${app.mail.from:noreply@goimay.com}")
    private String fromEmail;
    
    @Value("${app.name:Goi May}")
    private String appName;
    
    private static final String APP_NAME_DISPLAY = "Gói Mây";
    
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("Attempting to send OTP email via SendGrid Web API to: {}", toEmail);
        log.info("Using from email: {}", fromEmail);
        
        Email from = new Email(fromEmail, APP_NAME_DISPLAY);
        Email to = new Email(toEmail);
        String subject = "[" + APP_NAME_DISPLAY + "] Ma xac minh dat lai mat khau";
        
        // HTML email with proper UTF-8 encoding
        String htmlContent = 
            "<!DOCTYPE html>" +
            "<html>" +
            "<head><meta charset=\"UTF-8\"></head>" +
            "<body style=\"font-family: Arial, sans-serif; padding: 20px;\">" +
            "<h2 style=\"color: #8B4513;\">Xin chào,</h2>" +
            "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>" + APP_NAME_DISPLAY + "</strong>.</p>" +
            "<div style=\"background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;\">" +
            "<p style=\"margin: 0; font-size: 14px; color: #666;\">Mã xác minh của bạn là:</p>" +
            "<h1 style=\"margin: 10px 0; color: #8B4513; letter-spacing: 5px;\">" + otp + "</h1>" +
            "</div>" +
            "<p><strong>Mã này sẽ hết hạn sau 5 phút.</strong></p>" +
            "<p style=\"color: #666;\">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
            "<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">" +
            "<p style=\"color: #999; font-size: 12px;\">Trân trọng,<br>Đội ngũ " + APP_NAME_DISPLAY + "</p>" +
            "</body>" +
            "</html>";
        
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);
        
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            
            log.info("SendGrid API response status: {}", response.getStatusCode());
            log.info("SendGrid API response body: {}", response.getBody());
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("Password reset OTP sent successfully to: {}", toEmail);
            } else {
                log.error("SendGrid API error: {} - {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Khong the gui email. Vui long thu lai sau.");
            }
        } catch (IOException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Khong the gui email. Vui long thu lai sau.");
        }
    }
}
