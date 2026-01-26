package com.goimay.service;

import com.goimay.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    public String processMessage(String userMessage, List<ChatRequest.ProductInfo> products) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Xin chào! Tôi có thể giúp gì cho bạn?";
        }
        
        String message = userMessage.toLowerCase().trim();
        
        // Xử lý các câu hỏi về sản phẩm
        if (message.contains("sản phẩm") || message.contains("set quà") || message.contains("có gì")) {
            return getProductsInfo(products);
        }
        
        if (message.contains("giá") || message.contains("bao nhiêu") || message.contains("chi phí")) {
            return getPriceInfo(products);
        }
        
        if (message.contains("giao hàng") || message.contains("ship") || message.contains("vận chuyển")) {
            return "Chúng tôi có dịch vụ giao hàng trên toàn quốc. Phí vận chuyển sẽ được tính dựa trên địa chỉ giao hàng. Bạn có thể liên hệ hotline hoặc đặt hàng trực tiếp trên website để được tư vấn chi tiết.";
        }
        
        if (message.contains("đặt hàng") || message.contains("mua") || message.contains("order")) {
            return "Bạn có thể đặt hàng bằng cách:\n1. Thêm sản phẩm vào giỏ hàng và thanh toán trực tuyến\n2. Liên hệ hotline để đặt hàng trực tiếp\n3. Đến cửa hàng của chúng tôi để xem và mua trực tiếp\n\nBạn muốn tôi giúp tìm sản phẩm phù hợp không?";
        }
        
        if (message.contains("thành phần") || message.contains("bao gồm") || message.contains("có gì trong")) {
            return "Mỗi set quà của Gói Mây bao gồm nhiều thành phần độc đáo như:\n- Giỏ mây tre đan thủ công\n- Đặc sản vùng miền\n- Các sản phẩm handmade truyền thống\n\nBạn muốn biết chi tiết về set quà nào cụ thể không?";
        }
        
        if (message.contains("xem") || message.contains("chi tiết") || message.contains("thông tin")) {
            return "Bạn có thể xem chi tiết sản phẩm bằng cách click vào sản phẩm trên trang sản phẩm. Tôi cũng có thể giới thiệu cho bạn một số sản phẩm phổ biến. Bạn muốn xem gì?";
        }
        
        // Tìm kiếm sản phẩm theo từ khóa
        String productMatch = searchProducts(message, products);
        if (productMatch != null) {
            return productMatch;
        }
        
        // Câu trả lời mặc định
        return "Cảm ơn bạn đã quan tâm đến Gói Mây! Tôi có thể giúp bạn:\n" +
               "- Tìm hiểu về các sản phẩm và set quà\n" +
               "- Tư vấn về giá cả\n" +
               "- Hướng dẫn đặt hàng\n" +
               "- Giải đáp thắc mắc về giao hàng\n\n" +
               "Bạn muốn biết thông tin gì cụ thể?";
    }
    
    private String getProductsInfo(List<ChatRequest.ProductInfo> products) {
        if (products == null || products.isEmpty()) {
            return "Hiện tại chúng tôi có nhiều set quà độc đáo với các thành phần từ mây tre đan thủ công kết hợp đặc sản vùng miền. Bạn có thể xem chi tiết trên trang sản phẩm của website.";
        }
        
        StringBuilder response = new StringBuilder("Chúng tôi có " + products.size() + " sản phẩm:\n\n");
        
        // Giới thiệu 5 sản phẩm đầu tiên
        products.stream()
            .limit(5)
            .forEach(p -> {
                response.append("• ").append(p.getName());
                if (p.getSalePrice() != null && p.getSalePrice() < p.getPrice()) {
                    response.append(" - Giá: ").append(formatPrice(p.getSalePrice()))
                           .append(" (giảm từ ").append(formatPrice(p.getPrice())).append(")");
                } else {
                    response.append(" - Giá: ").append(formatPrice(p.getPrice()));
                }
                if (p.getCategory() != null) {
                    response.append(" - Danh mục: ").append(p.getCategory());
                }
                response.append("\n");
            });
        
        if (products.size() > 5) {
            response.append("\n... và ").append(products.size() - 5).append(" sản phẩm khác.");
        }
        
        response.append("\nBạn muốn xem chi tiết sản phẩm nào không?");
        
        return response.toString();
    }
    
    private String getPriceInfo(List<ChatRequest.ProductInfo> products) {
        if (products == null || products.isEmpty()) {
            return "Giá sản phẩm của chúng tôi dao động từ vài trăm nghìn đến vài triệu đồng tùy theo set quà và thành phần. Bạn có thể xem chi tiết giá trên trang sản phẩm.";
        }
        
        double minPrice = products.stream()
            .mapToDouble(p -> p.getSalePrice() != null && p.getSalePrice() < p.getPrice() 
                ? p.getSalePrice() : p.getPrice())
            .min()
            .orElse(0);
        
        double maxPrice = products.stream()
            .mapToDouble(p -> p.getSalePrice() != null && p.getSalePrice() < p.getPrice() 
                ? p.getSalePrice() : p.getPrice())
            .max()
            .orElse(0);
        
        return String.format(
            "Giá sản phẩm của chúng tôi dao động từ %s đến %s.\n\n" +
            "Nhiều sản phẩm đang có chương trình khuyến mãi với giá ưu đãi. " +
            "Bạn muốn tôi giới thiệu một số sản phẩm phù hợp với ngân sách của bạn không?",
            formatPrice(minPrice),
            formatPrice(maxPrice)
        );
    }
    
    private String searchProducts(String query, List<ChatRequest.ProductInfo> products) {
        if (products == null || products.isEmpty()) {
            return null;
        }
        
        List<ChatRequest.ProductInfo> matches = products.stream()
            .filter(p -> {
                String name = (p.getName() != null ? p.getName() : "").toLowerCase();
                String desc = (p.getDescription() != null ? p.getDescription() : "").toLowerCase();
                String category = (p.getCategory() != null ? p.getCategory() : "").toLowerCase();
                
                return name.contains(query) || desc.contains(query) || category.contains(query);
            })
            .limit(3)
            .collect(Collectors.toList());
        
        if (matches.isEmpty()) {
            return null;
        }
        
        StringBuilder response = new StringBuilder("Tôi tìm thấy " + matches.size() + " sản phẩm phù hợp:\n\n");
        matches.forEach(p -> {
            response.append("• ").append(p.getName());
            if (p.getSalePrice() != null && p.getSalePrice() < p.getPrice()) {
                response.append(" - ").append(formatPrice(p.getSalePrice()));
            } else {
                response.append(" - ").append(formatPrice(p.getPrice()));
            }
            response.append("\n");
        });
        response.append("\nBạn có thể click vào sản phẩm để xem chi tiết!");
        
        return response.toString();
    }
    
    private String formatPrice(Double price) {
        if (price == null) return "0đ";
        return String.format("%,.0fđ", price);
    }
}
