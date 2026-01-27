package com.goimay.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class EmailService {
    
    @Value("${SENDGRID_API_KEY:${MAIL_PASSWORD:}}")
    private String sendGridApiKey;
    
    @Value("${app.mail.from:noreply@goimay.com}")
    private String fromEmail;
    
    @Value("${app.name:Gói Mây}")
    private String appName;
    
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("Attempting to send OTP email via SendGrid Web API to: {}", toEmail);
        log.info("Using from email: {}", fromEmail);
        
        Email from = new Email(fromEmail, appName);
        Email to = new Email(toEmail);
        String subject = "[" + appName + "] Mã xác minh đặt lại mật khẩu";
        
        String emailContent = 
            "Xin chào,\n\n" +
            "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản " + appName + ".\n\n" +
            "Mã xác minh của bạn là: " + otp + "\n\n" +
            "Mã này sẽ hết hạn sau 5 phút.\n\n" +
            "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ " + appName;
        
        Content content = new Content("text/plain", emailContent);
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
                throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
            }
        } catch (IOException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
}
