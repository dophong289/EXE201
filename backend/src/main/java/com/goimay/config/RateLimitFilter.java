package com.goimay.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Filter for sensitive endpoints to prevent brute force attacks.
 * 
 * Limits:
 * - /api/auth/login: 5 requests per minute per IP
 * - /api/auth/forgot-password: 3 requests per minute per IP
 * - /api/auth/register: 3 requests per minute per IP
 * - /api/chat: 10 requests per minute per IP
 */
@Component
@Order(1) // Run before other filters
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    // Cache buckets per IP address
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> chatBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String clientIP = getClientIP(request);
        
        // Check rate limits for sensitive endpoints
        if (path.equals("/api/auth/login") && request.getMethod().equals("POST")) {
            if (!checkRateLimit(loginBuckets, clientIP, 5, Duration.ofMinutes(1))) {
                sendTooManyRequestsResponse(response, "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút.");
                log.warn("Rate limit exceeded for login from IP: {}", clientIP);
                return;
            }
        }
        
        if (path.equals("/api/auth/forgot-password") && request.getMethod().equals("POST")) {
            if (!checkRateLimit(forgotPasswordBuckets, clientIP, 3, Duration.ofMinutes(1))) {
                sendTooManyRequestsResponse(response, "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.");
                log.warn("Rate limit exceeded for forgot-password from IP: {}", clientIP);
                return;
            }
        }
        
        if (path.equals("/api/auth/register") && request.getMethod().equals("POST")) {
            if (!checkRateLimit(registerBuckets, clientIP, 3, Duration.ofMinutes(1))) {
                sendTooManyRequestsResponse(response, "Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 phút.");
                log.warn("Rate limit exceeded for register from IP: {}", clientIP);
                return;
            }
        }
        
        if (path.startsWith("/api/chat") && request.getMethod().equals("POST")) {
            if (!checkRateLimit(chatBuckets, clientIP, 10, Duration.ofMinutes(1))) {
                sendTooManyRequestsResponse(response, "Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ một lát.");
                log.warn("Rate limit exceeded for chat from IP: {}", clientIP);
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private boolean checkRateLimit(Map<String, Bucket> buckets, String clientIP, int tokens, Duration refillDuration) {
        Bucket bucket = buckets.computeIfAbsent(clientIP, ip -> createBucket(tokens, refillDuration));
        return bucket.tryConsume(1);
    }

    private Bucket createBucket(int tokens, Duration refillDuration) {
        Bandwidth limit = Bandwidth.classic(tokens, Refill.greedy(tokens, refillDuration));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        // Check for proxy headers
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }

    private void sendTooManyRequestsResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":429,\"message\":\"" + message + "\"}");
    }
}
