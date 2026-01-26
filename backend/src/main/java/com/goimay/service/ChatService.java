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
        
        // Xử lý các câu hỏi về thông tin liên hệ (ưu tiên cao nhất)
        if (message.contains("liên hệ") || message.contains("contact") || 
            message.contains("hotline") || message.contains("số điện thoại") || 
            message.contains("phone") || message.contains("điện thoại") ||
            message.contains("email") || message.contains("mail") ||
            message.contains("địa chỉ") || message.contains("address") ||
            message.contains("cửa hàng") || message.contains("văn phòng") ||
            message.contains("trụ sở") || message.contains("location")) {
            return getContactInfo();
        }
        
        // Xử lý các câu hỏi về giờ làm việc
        if (message.contains("giờ làm việc") || message.contains("giờ mở cửa") || 
            message.contains("mở cửa") || message.contains("đóng cửa") ||
            message.contains("working hours") || message.contains("opening hours")) {
            return "Chúng tôi phục vụ khách hàng từ thứ 2 đến chủ nhật:\n" +
                   "• Thứ 2 - Thứ 6: 8:00 - 18:00\n" +
                   "• Thứ 7 - Chủ nhật: 9:00 - 17:00\n\n" +
                   "Bạn có thể liên hệ với chúng tôi bất cứ lúc nào qua website hoặc để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất có thể!";
        }
        
        // Xử lý các câu hỏi về chính sách
        if (message.contains("chính sách") || message.contains("policy") ||
            message.contains("đổi trả") || message.contains("hoàn tiền") ||
            message.contains("bảo hành") || message.contains("warranty")) {
            return "Chúng tôi có các chính sách sau:\n\n" +
                   "📦 Đổi trả hàng:\n" +
                   "• Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng\n" +
                   "• Sản phẩm phải còn nguyên vẹn, chưa sử dụng\n\n" +
                   "💰 Hoàn tiền:\n" +
                   "• Hoàn tiền 100% nếu sản phẩm lỗi hoặc không đúng mô tả\n\n" +
                   "🔧 Bảo hành:\n" +
                   "• Bảo hành chất lượng sản phẩm trong vòng 30 ngày\n\n" +
                   "Bạn có thể xem chi tiết chính sách trên website hoặc liên hệ trực tiếp với chúng tôi để được tư vấn cụ thể.";
        }
        
        // Xử lý các câu hỏi về giao hàng
        if (message.contains("giao hàng") || message.contains("ship") || 
            message.contains("vận chuyển") || message.contains("delivery") ||
            message.contains("phí ship") || message.contains("phí vận chuyển")) {
            return "Chúng tôi có dịch vụ giao hàng trên toàn quốc:\n\n" +
                   "🚚 Phí vận chuyển:\n" +
                   "• Nội thành: 30.000đ - 50.000đ\n" +
                   "• Tỉnh thành khác: 50.000đ - 100.000đ (tùy khoảng cách)\n" +
                   "• Miễn phí ship cho đơn hàng trên 500.000đ\n\n" +
                   "⏱️ Thời gian giao hàng:\n" +
                   "• Nội thành: 1-2 ngày\n" +
                   "• Tỉnh thành khác: 3-5 ngày\n\n" +
                   "Bạn có thể đặt hàng trực tiếp trên website hoặc liên hệ hotline để được tư vấn chi tiết về phí vận chuyển cho địa chỉ cụ thể của bạn.";
        }
        
        // Xử lý các câu hỏi về đặt hàng
        if (message.contains("đặt hàng") || message.contains("mua") || 
            message.contains("order") || message.contains("thanh toán") ||
            message.contains("payment")) {
            return "Bạn có thể đặt hàng bằng các cách sau:\n\n" +
                   "1️⃣ Đặt hàng online:\n" +
                   "• Thêm sản phẩm vào giỏ hàng\n" +
                   "• Điền thông tin giao hàng\n" +
                   "• Thanh toán trực tuyến hoặc COD\n\n" +
                   "2️⃣ Đặt hàng qua hotline:\n" +
                   "• Gọi điện trực tiếp để được tư vấn\n" +
                   "• Nhân viên sẽ hỗ trợ đặt hàng cho bạn\n\n" +
                   "3️⃣ Đến cửa hàng:\n" +
                   "• Xem và chọn sản phẩm trực tiếp\n" +
                   "• Được tư vấn chi tiết từ nhân viên\n\n" +
                   "Bạn muốn tôi giúp tìm sản phẩm phù hợp không?";
        }
        
        // Xử lý các câu hỏi về giá cả (chỉ khi không phải hỏi về giá ship)
        if ((message.contains("giá") || message.contains("bao nhiêu") || message.contains("chi phí")) &&
            !message.contains("ship") && !message.contains("vận chuyển") && !message.contains("giao hàng")) {
            return getPriceInfo(products);
        }
        
        // Xử lý các câu hỏi về thành phần sản phẩm
        if (message.contains("thành phần") || message.contains("bao gồm") || 
            message.contains("có gì trong") || message.contains("gồm những gì")) {
            return "Mỗi set quà của Gói Mây bao gồm nhiều thành phần độc đáo:\n\n" +
                   "🎁 Giỏ mây tre đan thủ công\n" +
                   "🍯 Đặc sản vùng miền\n" +
                   "✨ Các sản phẩm handmade truyền thống\n" +
                   "🌾 Nguyên liệu tự nhiên 100%\n\n" +
                   "Bạn muốn biết chi tiết về set quà nào cụ thể không? Tôi có thể giới thiệu cho bạn!";
        }
        
        // Xử lý các câu hỏi về sản phẩm (sau khi đã loại trừ các trường hợp khác)
        if (message.contains("sản phẩm") || message.contains("set quà") || 
            message.contains("có những gì") || message.contains("bán gì")) {
            return getProductsInfo(products);
        }
        
        // Tìm kiếm sản phẩm theo từ khóa (chỉ khi không phải câu hỏi về liên hệ)
        if (!message.contains("liên hệ") && !message.contains("contact") &&
            !message.contains("hotline") && !message.contains("phone") &&
            !message.contains("email") && !message.contains("địa chỉ")) {
            String productMatch = searchProducts(message, products);
            if (productMatch != null) {
                return productMatch;
            }
        }
        
        // Xử lý các câu hỏi về thông tin chung (không phải về sản phẩm)
        if (message.contains("xem") || message.contains("chi tiết")) {
            if (message.contains("sản phẩm") || message.contains("set quà")) {
                return "Bạn có thể xem chi tiết sản phẩm bằng cách click vào sản phẩm trên trang sản phẩm. Tôi cũng có thể giới thiệu cho bạn một số sản phẩm phổ biến. Bạn muốn xem gì?";
            }
            return "Bạn muốn xem thông tin gì cụ thể? Tôi có thể giúp bạn về:\n" +
                   "• Thông tin liên hệ\n" +
                   "• Sản phẩm và set quà\n" +
                   "• Giá cả\n" +
                   "• Chính sách giao hàng và đổi trả";
        }
        
        // Câu trả lời mặc định
        return "Cảm ơn bạn đã quan tâm đến Gói Mây! 😊\n\n" +
               "Tôi có thể giúp bạn:\n" +
               "📞 Thông tin liên hệ\n" +
               "🛍️ Tìm hiểu về sản phẩm và set quà\n" +
               "💰 Tư vấn về giá cả\n" +
               "🚚 Hướng dẫn đặt hàng và giao hàng\n" +
               "📋 Chính sách đổi trả, bảo hành\n\n" +
               "Bạn muốn biết thông tin gì cụ thể?";
    }
    
    private String getContactInfo() {
        return "📞 Thông tin liên hệ Gói Mây:\n\n" +
               "📱 Điện thoại: 098 552 39 82\n" +
               "📧 Email: goimayvn@gmail.com\n\n" +
               "💬 Mạng xã hội:\n" +
               "• Facebook: facebook.com/goimay\n" +
               "• TikTok: @goimay_\n" +
               "• Zalo: zalo.me/19009300\n\n" +
               "⏰ Giờ làm việc:\n" +
               "• Thứ 2 - Thứ 6: 8:00 - 18:00\n" +
               "• Thứ 7 - Chủ nhật: 9:00 - 17:00\n\n" +
               "🌐 Website: www.goimay.vn\n\n" +
               "Chúng tôi luôn sẵn sàng hỗ trợ bạn! Bạn có thể liên hệ bất cứ lúc nào qua các kênh trên hoặc để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất có thể.";
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
