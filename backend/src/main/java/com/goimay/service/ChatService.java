package com.goimay.service;

import com.goimay.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    @Value("${OPENAI_API_KEY:}")
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private static final String SYSTEM_PROMPT = 
        "Bạn là trợ lý tư vấn set quà Tết (ngân sách 500–800k).\n\n" +
        "PERSONA:\n" +
        "- Xưng hô: 'mình'. Gọi khách là 'bạn/anh/chị' tùy ngữ cảnh.\n" +
        "- Giọng điệu: Truyền thống – ấm áp, tinh tế, giàu không khí Tết Việt (gợi cảm giác sum vầy, tri ân, lộc, an khang).\n\n" +
        "NGUYÊN TẮC:\n" +
        "1. Không bịa: Nếu thiếu thông tin (địa chỉ, ngày cần, số lượng) → hỏi lại 1–2 câu nhẹ nhàng.\n" +
        "2. Tư vấn đúng tâm: Ưu tiên tư vấn theo đối tượng + ngân sách + phong cách.\n" +
        "3. Luôn chốt nhẹ: Kết thúc bằng 1 câu hỏi để dẫn dắt khách hàng.\n" +
        "4. Không sales lố: Tránh hứa chắc chắn 100% nếu chưa check, tránh dùng từ ngữ quá vồn vã.\n\n" +
        "FORMAT CÂU TRẢ LỜI (80%):\n" +
        "1. Mở: 1 câu ấm áp, đồng cảm.\n" +
        "2. Gợi ý: 2–3 lựa chọn (mỗi gợi ý 1–2 dòng mô tả ngắn).\n" +
        "3. Bullet: • Phù hợp ai / • Điểm nhấn / • Thông điệp.\n" +
        "4. Kết: 1 câu hỏi chốt nhẹ.\n\n" +
        "CONTEXT:\n" +
        "- Chỉ tư vấn các sản phẩm có trong danh sách được cung cấp.\n" +
        "- Giá ship: Nội thành 30k-50k, Tỉnh 50k-100k. Freeship đơn >500k.\n" +
        "- Hotline: 098 552 39 82.";

    public String processMessage(String userMessage, List<ChatRequest.ProductInfo> products) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Xin chào! Mình là trợ lý Gói Mây. Bạn cần tư vấn set quà Tết cho gia đình hay đối tác ạ?";
        }

        // Nếu có API Key, dùng OpenAI
        if (openAiApiKey != null && !openAiApiKey.isEmpty()) {
            try {
                return callOpenAI(userMessage, products);
            } catch (Exception e) {
                log.error("Lỗi khi gọi OpenAI: {}", e.getMessage());
                // Fallback xuống logic cũ nếu lỗi
            }
        }

        return processRuleBasedMessage(userMessage, products);
    }

    private String callOpenAI(String userMessage, List<ChatRequest.ProductInfo> products) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        
        List<Map<String, String>> messages = new ArrayList<>();
        
        // System Message
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        
        // Context Message (Product List)
        String productContext = "Danh sách sản phẩm hiện có:\n" + formatProductListForAI(products);
        messages.add(Map.of("role", "system", "content", productContext));
        
        // User Message
        messages.add(Map.of("role", "user", "content", userMessage));

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(OPENAI_API_URL, entity, Map.class);
            
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            log.error("OpenAI API call failed", e);
            throw e;
        }
        
        return "Xin lỗi, mình đang gặp chút trục trặc. Bạn chờ mình xíu nhé!";
    }

    private String formatProductListForAI(List<ChatRequest.ProductInfo> products) {
        if (products == null || products.isEmpty()) return "Không có thông tin sản phẩm.";
        StringBuilder sb = new StringBuilder();
        for (ChatRequest.ProductInfo p : products) {
            sb.append(String.format("- %s (Giá: %s, Sale: %s): %s. Danh mục: %s\n",
                p.getName(), 
                formatPrice(p.getPrice()), 
                p.getSalePrice() != null ? formatPrice(p.getSalePrice()) : "Không",
                p.getDescription(),
                p.getCategory()));
        }
        return sb.toString();
    }

    // --- OLD RULE-BASED LOGIC (FALLBACK) ---

    private String processRuleBasedMessage(String userMessage, List<ChatRequest.ProductInfo> products) {
        String message = userMessage.toLowerCase().trim();
        
        // Logic cũ giữ nguyên để fallback
        if (message.contains("liên hệ") || message.contains("hotline") || message.contains("điện thoại")) {
            return getContactInfo();
        }
        // ... (Giữ các logic cơ bản)
        
        return "Chào bạn, mình là trợ lý Gói Mây. Hiện tại mình đang cập nhật thêm dữ liệu để tư vấn tốt hơn. " +
               "Bạn cần hỗ trợ về sản phẩm hay chính sách giao hàng ạ?"; // Rút gọn fallback
    }

    private String getContactInfo() {
        return "📞 Hotline: 098 552 39 82\n🌐 Website: www.goimay.vn";
    }

    private String formatPrice(Double price) {
        if (price == null) return "0đ";
        return String.format("%,.0fđ", price);
    }
}
