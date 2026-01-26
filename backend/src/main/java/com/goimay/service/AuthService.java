package com.goimay.service;

import com.goimay.dto.AuthResponse;
import com.goimay.dto.GoogleLoginRequest;
import com.goimay.dto.LoginRequest;
import com.goimay.dto.RegisterRequest;
import com.goimay.model.Role;
import com.goimay.model.User;
import com.goimay.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    @Value("${google.client-id:}")
    private String googleClientId;
    
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        
        // Tạo user mới
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER)
                .enabled(true)
                .build();
        
        userRepository.save(user);
        
        // Tạo token
        String token = jwtService.generateToken(user);
        
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        String token = jwtService.generateToken(user);
        
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new RuntimeException("Token Google không hợp lệ");
            }
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            
            // Tìm user theo Google ID hoặc email
            User user = userRepository.findByGoogleId(googleId)
                    .orElse(userRepository.findByEmail(email).orElse(null));
            
            if (user == null) {
                // Tạo user mới nếu chưa tồn tại
                user = User.builder()
                        .fullName(name != null ? name : email.split("@")[0])
                        .email(email)
                        .password(passwordEncoder.encode("GOOGLE_AUTH_" + googleId)) // Password không dùng được
                        .googleId(googleId)
                        .provider("google")
                        .role(Role.USER)
                        .enabled(true)
                        .build();
                userRepository.save(user);
            } else {
                // Cập nhật Google ID nếu user đã tồn tại nhưng chưa có Google ID
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    user.setProvider("google");
                    userRepository.save(user);
                }
            }
            
            // Tạo JWT token
            String token = jwtService.generateToken(user);
            
            return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
            
        } catch (Exception e) {
            throw new RuntimeException("Đăng nhập Google thất bại: " + e.getMessage());
        }
    }
}
