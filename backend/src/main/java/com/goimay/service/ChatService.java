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

    // --- IMPROVED RULE-BASED LOGIC (FALLBACK) ---

    private String processRuleBasedMessage(String userMessage, List<ChatRequest.ProductInfo> products) {
        String message = userMessage.toLowerCase().trim();
        Double budget = extractBudget(message); // Ưu tiên tìm ngân sách

        // 1. Nếu hỏi về liên hệ
        if (message.contains("liên hệ") || message.contains("hotline") || message.contains("điện thoại") || message.contains("địa chỉ")) {
            return getContactInfo();
        }

        // 2. Logic "Tư vấn" (Giả lập AI) - Mở rộng keywords
        if (budget != null || 
            message.contains("tư vấn") || message.contains("gợi ý") || 
            message.contains("mua") || message.contains("tìm") || 
            message.contains("cần") || message.contains("chọn") ||
            // Keywords về quà/set
            message.contains("set quà") || message.contains("set qua") ||
            message.contains("quà tết") || message.contains("qua tet") ||
            message.contains("quà tặng") || message.contains("qua tang") ||
            message.contains("quà biếu") || message.contains("qua bieu") ||
            message.contains("hộp quà") || message.contains("hop qua") ||
            message.contains("giỏ quà") || message.contains("gio qua") ||
            // Keywords về giá
            message.contains("giá rẻ") || message.contains("gia re") ||
            message.contains("rẻ") || message.contains("tiết kiệm") ||
            message.contains("tiet kiem") || message.contains("giá tốt") ||
            message.contains("gia tot") || message.contains("khuyến mãi") ||
            message.contains("khuyen mai") || message.contains("giảm giá") ||
            message.contains("giam gia") || message.contains("sale") ||
            // Keywords về đối tượng
            message.contains("biếu") || message.contains("bieu") ||
            message.contains("tặng") || message.contains("tang") ||
            message.contains("gia đình") || message.contains("gia dinh") ||
            message.contains("sếp") || message.contains("sep") ||
            message.contains("đối tác") || message.contains("doi tac") ||
            message.contains("khách hàng") || message.contains("khach hang") ||
            message.contains("bố mẹ") || message.contains("bo me") ||
            message.contains("ông bà") || message.contains("ong ba") ||
            // Keywords về chất lượng
            message.contains("đẹp") || message.contains("dep") ||
            message.contains("sang") || message.contains("cao cấp") ||
            message.contains("cao cap") || message.contains("chất lượng") ||
            message.contains("chat luong") || message.contains("xịn") ||
            // Keywords về Tết
            message.contains("tết") || message.contains("tet") ||
            message.contains("xuân") || message.contains("xuan") ||
            message.contains("năm mới") || message.contains("nam moi")) {
            
            // Tìm sản phẩm trong khoảng giá gần đúng
            List<ChatRequest.ProductInfo> suitableProducts = findProductsAroundBudget(products, budget);
            boolean isAlternativeSuggestion = false;

            if (suitableProducts.isEmpty() && budget != null) {
                // Nếu không tìm thấy trong khoảng giá -> Tìm sản phẩm rẻ hơn (dưới ngân sách)
                suitableProducts = findProductsUnderBudget(products, budget);
                isAlternativeSuggestion = true;
            }

            if (suitableProducts.isEmpty()) {
                // Nếu vẫn chưa tìm thấy hoặc không có budget -> Lấy 3 sản phẩm đầu
                suitableProducts = products.stream().limit(3).collect(Collectors.toList());
                isAlternativeSuggestion = (budget != null); // Nếu có budget mà phải fallback về 3 sp đầu thì coi như là gợi ý thay thế
            }

            StringBuilder sb = new StringBuilder();
            
            if (isAlternativeSuggestion && budget != null) {
                sb.append("Chào bạn, hiện tại bên mình chưa có set quà đúng mức giá **").append(formatPrice(budget)).append("**.\n");
                sb.append("Tuy nhiên, mình xin gợi ý vài lựa chọn **giá tốt hơn** và cũng rất chất lượng nha:\n\n");
            } else {
                sb.append("Chào bạn, mình hiểu bạn đang quan tâm đến quà Tết. ");
                if (budget != null) {
                    sb.append("Với ngân sách khoảng ").append(formatPrice(budget)).append(", ");
                }
                sb.append("mình xin gợi ý vài lựa chọn nổi bật:\n\n");
            }

            for (ChatRequest.ProductInfo p : suitableProducts) {
                sb.append("🎁 **").append(p.getName()).append("** - ").append(formatPrice(p.getSalePrice() != null ? p.getSalePrice() : p.getPrice())).append("\n");
                sb.append("   • ").append(p.getDescription() != null ? p.getDescription() : "Thiết kế tinh tế, đậm chất Tết.").append("\n");
            }

            sb.append("\n• **Phù hợp**: Biếu tặng gia đình, đối tác.\n");
            sb.append("• **Hỗ trợ**: Freeship đơn >500k, đóng gói cẩn thận.\n\n");
            sb.append("Bạn ưng ý set nào chưa ạ?");
            
            return sb.toString();
        }

        // 3. Các logic cũ khác (Ship, Chính sách...)
        if (message.contains("ship") || message.contains("giao hàng") || message.contains("vận chuyển")) {
            return "Bên mình ship nội thành 30-50k, tỉnh 50-100k. Freeship đơn trên 500k. Bạn cần giao đi đâu ạ?";
        }

        // Logic cũ (nếu hỏi sản phẩm chung chung nhưng ko khớp keywords trên)
        if (message.contains("sản phẩm") || message.contains("set quà")) {
             return getProductsInfo(products);
        }

        // Catch-all: Hướng dẫn người dùng các mẫu câu có thể hiểu được
        return "Mình chưa hiểu rõ ý bạn lắm (mình đang học việc mà 😅).\n\n" +
               "Bạn thử hỏi ngắn gọn giúp mình nha, ví dụ:\n" +
               "👉 \"Tư vấn set 500k\"\n" +
               "👉 \"Phí ship thế nào\"\n" +
               "👉 \"Cho xin hotline\"\n\n" +
               "Hoặc bạn cần gặp nhân viên tư vấn trực tiếp thì nhắn \"Liên hệ\" nhé!";
    }

    private Double extractBudget(String message) {
        try {
            // Regex bắt 500k, 700 k, 500K... (có hỗ trợ khoảng trắng)
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("(\\d+)\\s*[kK]");
            java.util.regex.Matcher m = p.matcher(message);
            if (m.find()) {
                return Double.parseDouble(m.group(1)) * 1000;
            }
            // Regex bắt số lớn 500000
            p = java.util.regex.Pattern.compile("(\\d{3,})"); 
            m = p.matcher(message);
            while (m.find()) {
                double val = Double.parseDouble(m.group(1));
                if (val > 10000) return val;
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    private List<ChatRequest.ProductInfo> findProductsAroundBudget(List<ChatRequest.ProductInfo> products, Double budget) {
        if (products == null) return new ArrayList<>();
        if (budget == null) return new ArrayList<>();

        // Lọc sản phẩm trong khoảng budget +/- 20%
        double min = budget * 0.8;
        double max = budget * 1.2;
        
        return products.stream()
                .filter(p -> {
                    double price = (p.getSalePrice() != null) ? p.getSalePrice() : p.getPrice();
                    return price >= min && price <= max;
                })
                .limit(3)
                .collect(Collectors.toList());
    }

    private List<ChatRequest.ProductInfo> findProductsUnderBudget(List<ChatRequest.ProductInfo> products, Double budget) {
        if (products == null || budget == null) return new ArrayList<>();
        
        // Tìm sản phẩm <= budget
        return products.stream()
                .filter(p -> {
                    double price = (p.getSalePrice() != null) ? p.getSalePrice() : p.getPrice();
                    return price <= budget;
                })
                .sorted((p1, p2) -> {
                     // Sắp xếp giá giảm dần (ưu tiên set gần budget nhất)
                     double price1 = (p1.getSalePrice() != null) ? p1.getSalePrice() : p1.getPrice();
                     double price2 = (p2.getSalePrice() != null) ? p2.getSalePrice() : p2.getPrice();
                     return Double.compare(price2, price1);
                })
                .limit(3)
                .collect(Collectors.toList());
    }

    private String getContactInfo() {
        return "📞 Hotline: 098 552 39 82\n🌐 Website: www.goimay.vn";
    }

    private String getProductsInfo(List<ChatRequest.ProductInfo> products) {
        // ... (Giữ nguyên hoặc rút gọn)
        return "Mình có nhiều set quà Tết đẹp lắm. Bạn vào mục Sản phẩm xem chi tiết nha!";
    }

    private String formatPrice(Double price) {
        if (price == null) return "0đ";
        return String.format("%,.0fđ", price);
    }
}
