package com.goimay.config;

import com.goimay.model.Article;
import com.goimay.model.Category;
import com.goimay.model.Product;
import com.goimay.repository.ArticleRepository;
import com.goimay.repository.CategoryRepository;
import com.goimay.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final ProductRepository productRepository;
    
    @Override
    public void run(String... args) {
        initCategories();
        initArticles();
        initProducts();
    }
    
    private void initCategories() {
        if (categoryRepository.count() == 0) {
            Category lamDep = new Category();
            lamDep.setName("Làm đẹp");
            lamDep.setSlug("lam-dep");
            lamDep.setDescription("Các bài viết về làm đẹp, chăm sóc da");
            categoryRepository.save(lamDep);
            
            Category goimay = new Category();
            goimay.setName("Gói Mây");
            goimay.setSlug("goi-may");
            goimay.setDescription("Tin tức và hoạt động của Gói Mây");
            categoryRepository.save(goimay);
            
            Category toc = new Category();
            toc.setName("Chăm sóc tóc");
            toc.setSlug("cham-soc-toc");
            toc.setDescription("Các bài viết về chăm sóc tóc");
            categoryRepository.save(toc);
        }
    }
    
    private void initArticles() {
        if (articleRepository.count() == 0) {
            Category lamDep = categoryRepository.findBySlug("lam-dep").orElse(null);
            Category goimay = categoryRepository.findBySlug("goi-may").orElse(null);
            
            // Featured article
            Article featured = new Article();
            featured.setTitle("Gói Mây x AAF: Ký kết hợp tác \"Chung tay cứu trợ chó mèo lang thang\" lần II");
            featured.setSlug("goi-may-x-aaf-ky-ket-hop-tac");
            featured.setSummary("Thông qua việc duy trì chương trình \"Chung tay cứu trợ chó mèo lang thang\" cùng AAF, Gói Mây mong muốn được góp thêm một phần nhỏ bé trong việc cung cấp nguồn lực cho các trạm cứu hộ.");
            featured.setContent("<p>Thông qua việc duy trì chương trình \"Chung tay cứu trợ chó mèo lang thang\" cùng AAF, Gói Mây mong muốn được góp thêm một phần nhỏ bé trong việc cung cấp nguồn lực cho các trạm cứu hộ, giúp duy trì và nâng cao phúc lợi của chó mèo lang thang, đồng thời, lan tỏa sự khích lệ và sẻ chia từ cộng đồng đến với những cá nhân, tập thể đang điều hành trạm và thực hiện công tác cứu hộ chó mèo.</p>");
            featured.setThumbnail("https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800");
            featured.setAuthor("Gói Mây Vietnam");
            featured.setPublishedAt(LocalDateTime.of(2025, 12, 3, 10, 0));
            featured.setFeatured(true);
            featured.setPublished(true);
            featured.setCategory(goimay);
            articleRepository.save(featured);
            
            // Article 2
            Article article2 = new Article();
            article2.setTitle("Vài \"tip\" giúp bạn tận hưởng trọn vẹn từng giây phút làm sạch da chết trên cơ thể cùng Cà phê Đắk Lắk");
            article2.setSlug("tip-lam-sach-da-chet-ca-phe-dak-lak");
            article2.setSummary("Hãy thử áp dụng một vài tip sau để gia tăng thêm những trải nghiệm thật \"chill\" với sản phẩm Cà phê Đắk Lắk làm sạch da chết cơ thể.");
            article2.setContent("<p>Hãy thử áp dụng một vài tip sau để gia tăng thêm những trải nghiệm thật \"chill\" với sản phẩm Cà phê Đắk Lắk làm sạch da chết cơ thể.</p>");
            article2.setThumbnail("https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800");
            article2.setAuthor("Gói Mây Vietnam");
            article2.setPublishedAt(LocalDateTime.of(2021, 10, 1, 10, 0));
            article2.setFeatured(false);
            article2.setPublished(true);
            article2.setCategory(lamDep);
            articleRepository.save(article2);
            
            // Article 3
            Article article3 = new Article();
            article3.setTitle("3 bước tẩy da chết hiệu quả dành cho mặt từ cà phê Đắk Lắk");
            article3.setSlug("3-buoc-tay-da-chet-hieu-qua");
            article3.setSummary("Việc tẩy da chết tuy chỉ mất từ 10 – 15s nhưng nó sẽ giúp bạn loại bỏ các tế bào da chết trên bề mặt da một cách dễ dàng.");
            article3.setContent("<p>Việc tẩy da chết tuy chỉ mất từ 10 – 15s nhưng nó sẽ giúp bạn loại bỏ các tế bào da chết trên bề mặt da một cách dễ dàng, giảm nguy cơ tắc nghẽn lỗ chân lông và nổi mụn.</p>");
            article3.setThumbnail("https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800");
            article3.setAuthor("Gói Mây Vietnam");
            article3.setPublishedAt(LocalDateTime.of(2021, 9, 22, 10, 0));
            article3.setFeatured(false);
            article3.setPublished(true);
            article3.setCategory(lamDep);
            articleRepository.save(article3);
            
            // Article 4
            Article article4 = new Article();
            article4.setTitle("Da dầu, mụn sẽ \"ăn chay\" như thế nào?");
            article4.setSlug("da-dau-mun-an-chay");
            article4.setSummary("Giống như các loại da khác, da dầu cũng sẽ đạt được trạng thái khỏe mạnh và mịn màng nếu được làm sạch đúng cách.");
            article4.setContent("<p>Giống như các loại da khác, da dầu cũng sẽ đạt được trạng thái khỏe mạnh và mịn màng nếu được làm sạch đúng cách và được bảo vệ với các sản phẩm phù hợp.</p>");
            article4.setThumbnail("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800");
            article4.setAuthor("Gói Mây Vietnam");
            article4.setPublishedAt(LocalDateTime.of(2021, 9, 22, 9, 0));
            article4.setFeatured(false);
            article4.setPublished(true);
            article4.setCategory(lamDep);
            articleRepository.save(article4);
            
            // Article 5 - Gói Mây category
            Article article5 = new Article();
            article5.setTitle("Chương trình \"Thu hồi pin cũ - Bảo vệ trái đất xanh\" năm 2025");
            article5.setSlug("chuong-trinh-thu-hoi-pin-cu-2025");
            article5.setSummary("Tiếp nối hành trình duy trì thói quen xanh, Gói Mây và Trường ĐH Sư phạm TP.HCM phát động chương trình \"Thu Hồi Pin Cũ – Bảo Vệ Trái Đất Xanh\" lần thứ 4.");
            article5.setContent("<p>Tiếp nối hành trình duy trì thói quen xanh, Gói Mây và Trường ĐH Sư phạm TP.HCM phát động chương trình \"Thu Hồi Pin Cũ – Bảo Vệ Trái Đất Xanh\" lần thứ 4 với 103 ĐIỂM THU HỒI trên 5 tỉnh thành: Hà Nội, Hồ Chí Minh, Cần Thơ, Đà Nẵng và Huế.</p>");
            article5.setThumbnail("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800");
            article5.setAuthor("Gói Mây Vietnam");
            article5.setPublishedAt(LocalDateTime.of(2025, 10, 24, 10, 0));
            article5.setFeatured(false);
            article5.setPublished(true);
            article5.setCategory(goimay);
            articleRepository.save(article5);
            
            // Article 6
            Article article6 = new Article();
            article6.setTitle("Gói Mây đã có mặt tại Nhật Bản");
            article6.setSlug("goi-may-da-co-mat-tai-nhat-ban");
            article6.setSummary("Thị trường Nhật Bản đã chính thức chào đón Gói Mây, cột mốc đánh dấu nấc thang mới trên hành trình vươn xa của thương hiệu.");
            article6.setContent("<p>Thị trường Nhật Bản đã chính thức chào đón Gói Mây, cột mốc đánh dấu nấc thang mới trên hành trình vươn xa của thương hiệu.</p>");
            article6.setThumbnail("https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800");
            article6.setAuthor("Gói Mây Vietnam");
            article6.setPublishedAt(LocalDateTime.of(2025, 8, 20, 10, 0));
            article6.setFeatured(false);
            article6.setPublished(true);
            article6.setCategory(goimay);
            articleRepository.save(article6);
        }
    }
    
    private void initProducts() {
        if (productRepository.count() == 0) {
            Product product1 = new Product();
            product1.setName("Cà phê Đắk Lắk làm sạch da chết cơ thể");
            product1.setSlug("ca-phe-dak-lak-lam-sach-da-chet");
            product1.setDescription("Sản phẩm làm sạch da chết từ cà phê Đắk Lắk");
            product1.setPrice(new BigDecimal("165000"));
            product1.setThumbnail("https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400");
            product1.setProductCategory("Tắm & Dưỡng Thể");
            product1.setStock(100);
            product1.setActive(true);
            productRepository.save(product1);
            
            Product product2 = new Product();
            product2.setName("Sữa rửa mặt nghệ Hưng Yên");
            product2.setSlug("sua-rua-mat-nghe-hung-yen");
            product2.setDescription("Sữa rửa mặt chiết xuất từ nghệ Hưng Yên");
            product2.setPrice(new BigDecimal("145000"));
            product2.setThumbnail("https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400");
            product2.setProductCategory("Chăm Sóc Da");
            product2.setStock(150);
            product2.setActive(true);
            productRepository.save(product2);
            
            Product product3 = new Product();
            product3.setName("Nước tẩy trang hoa hồng");
            product3.setSlug("nuoc-tay-trang-hoa-hong");
            product3.setDescription("Nước tẩy trang chiết xuất từ hoa hồng");
            product3.setPrice(new BigDecimal("175000"));
            product3.setSalePrice(new BigDecimal("149000"));
            product3.setThumbnail("https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400");
            product3.setProductCategory("Chăm Sóc Da");
            product3.setStock(80);
            product3.setActive(true);
            productRepository.save(product3);
            
            Product product4 = new Product();
            product4.setName("Dầu gội bưởi Việt Nam");
            product4.setSlug("dau-goi-buoi-viet-nam");
            product4.setDescription("Dầu gội chiết xuất từ bưởi Việt Nam");
            product4.setPrice(new BigDecimal("185000"));
            product4.setThumbnail("https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400");
            product4.setProductCategory("Chăm Sóc Tóc");
            product4.setStock(120);
            product4.setActive(true);
            productRepository.save(product4);
        }
    }
}

