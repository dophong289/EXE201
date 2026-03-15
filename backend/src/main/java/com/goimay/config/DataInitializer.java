package com.goimay.config;

import com.goimay.model.Article;
import com.goimay.model.Category;
import com.goimay.model.Product;
import com.goimay.model.Role;
import com.goimay.model.User;
import com.goimay.repository.ArticleRepository;
import com.goimay.repository.CategoryRepository;
import com.goimay.repository.ProductRepository;
import com.goimay.repository.UserRepository;
import com.goimay.service.DataExportImportService;
import com.goimay.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataExportImportService dataExportImportService;
    private final SiteSettingService siteSettingService;

    @Value("${app.admin.email:admin@goimay.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.name:Administrator}")
    private String adminName;

    @Value("${app.admin.phone:0123456789}")
    private String adminPhone;
    
    @Override
    public void run(String... args) {
        initAdminUser();
        initFakeUsersIfNeeded();
        // Import tất cả dữ liệu từ file nếu có (để đồng bộ giữa các máy)
        dataExportImportService.importAllData();
        // Import site settings riêng (nếu chưa có trong all-data.json)
        dataExportImportService.importSiteSettings();
        // Khởi tạo default settings nếu chưa có
        siteSettingService.initializeDefaults();
        // Chỉ khởi tạo dữ liệu mặc định nếu database trống
        if (categoryRepository.count() == 0) {
            initCategories();
        }
        if (articleRepository.count() == 0) {
            initArticles();
        }
        if (productRepository.count() == 0) {
            initProducts();
        }
    }
    
    private void initAdminUser() {
        // Kiểm tra xem đã có admin chưa
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .phone(adminPhone)
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            
            userRepository.save(admin);
            System.out.println("========================================");
            System.out.println("Đã tạo tài khoản Admin mặc định:");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: " + adminPassword);
            System.out.println("========================================");
        }
    }

    /** Tạo thêm tối đa 33 tài khoản giống người thật khi số user < 50 (ví dụ đang có 17 thì thêm 33 thành 50). */
    private void initFakeUsersIfNeeded() {
        long count = userRepository.count();
        if (count >= 50) return;
        int toAdd = (int) Math.min(33, 50 - count);
        String encodedPassword = passwordEncoder.encode("User@123");
        List<FakeUserData> list = FakeUserData.list33();
        int added = 0;
        for (int i = 0; i < toAdd && i < list.size(); i++) {
            FakeUserData d = list.get(i);
            String email = "seeduser" + (count + i + 1) + "@goimay.vn";
            if (userRepository.existsByEmail(email)) continue;
            User u = User.builder()
                    .fullName(d.fullName)
                    .email(email)
                    .password(encodedPassword)
                    .phone(d.phone)
                    .address(d.address)
                    .birthDate(d.birthDate)
                    .gender(d.gender)
                    .provider("local")
                    .role(Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(u);
            added++;
        }
        if (added > 0) {
            System.out.println("[DataInitializer] Đã tạo " + added + " tài khoản người dùng mẫu (mật khẩu: User@123).");
        }
    }
    
    private void initCategories() {
        if (categoryRepository.count() == 0) {
            Category langNghe = new Category();
            langNghe.setName("Làng nghề");
            langNghe.setSlug("lang-nghe");
            langNghe.setDescription("Khám phá các làng nghề truyền thống Việt Nam");
            categoryRepository.save(langNghe);
            
            Category ngheNhan = new Category();
            ngheNhan.setName("Nghệ nhân");
            ngheNhan.setSlug("nghe-nhan");
            ngheNhan.setDescription("Câu chuyện về những nghệ nhân gìn giữ nghề thủ công");
            categoryRepository.save(ngheNhan);
            
            Category dacSan = new Category();
            dacSan.setName("Đặc sản");
            dacSan.setSlug("dac-san");
            dacSan.setDescription("Đặc sản vùng miền Việt Nam");
            categoryRepository.save(dacSan);
            
            Category setQua = new Category();
            setQua.setName("Set quà");
            setQua.setSlug("set-qua");
            setQua.setDescription("Bộ sưu tập set quà tặng");
            categoryRepository.save(setQua);
            
            Category vanHoa = new Category();
            vanHoa.setName("Văn hóa Việt");
            vanHoa.setSlug("van-hoa-viet");
            vanHoa.setDescription("Văn hóa và truyền thống Việt Nam");
            categoryRepository.save(vanHoa);
        }
    }
    
    private void initArticles() {
        if (articleRepository.count() == 0) {
            Category langNghe = categoryRepository.findBySlug("lang-nghe").orElse(null);
            Category ngheNhan = categoryRepository.findBySlug("nghe-nhan").orElse(null);
            Category dacSan = categoryRepository.findBySlug("dac-san").orElse(null);
            Category setQua = categoryRepository.findBySlug("set-qua").orElse(null);
            Category vanHoa = categoryRepository.findBySlug("van-hoa-viet").orElse(null);
            
            // Featured article
            Article featured = new Article();
            featured.setTitle("Gói Mây hợp tác cùng 50 làng nghề truyền thống - Hành trình gìn giữ văn hóa Việt");
            featured.setSlug("goi-may-hop-tac-lang-nghe");
            featured.setSummary("Thông qua việc hợp tác với các làng nghề truyền thống trên khắp Việt Nam, Gói Mây mong muốn góp phần bảo tồn nghề thủ công và tạo sinh kế bền vững cho cộng đồng nghệ nhân.");
            featured.setContent("<p>Gói Mây tự hào kết nối với hơn 50 làng nghề truyền thống trên khắp Việt Nam, từ làng mây tre đan Phú Vinh (Hà Nội), làng cói Kim Sơn (Ninh Bình), đến các làng nghề ở Tây Nguyên và đồng bằng sông Cửu Long.</p><p>Mỗi sản phẩm của Gói Mây không chỉ là món quà - mà còn là cách chúng tôi góp phần gìn giữ và phát triển nghề thủ công truyền thống, đồng thời tạo sinh kế ổn định cho các nghệ nhân làng nghề.</p>");
            featured.setThumbnail("https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=800");
            featured.setAuthor("Gói Mây Vietnam");
            featured.setPublishedAt(LocalDateTime.of(2026, 1, 10, 10, 0));
            featured.setFeatured(true);
            featured.setPublished(true);
            featured.setCategory(langNghe);
            articleRepository.save(featured);
            
            // Article 2 - Làng nghề Phú Vinh
            Article article2 = new Article();
            article2.setTitle("Làng nghề mây tre đan Phú Vinh - 400 năm gìn giữ tinh hoa");
            article2.setSlug("lang-nghe-phu-vinh");
            article2.setSummary("Làng Phú Vinh (Chương Mỹ, Hà Nội) với hơn 400 năm lịch sử là cái nôi của nghề đan mây tre tinh xảo nhất Việt Nam.");
            article2.setContent("<p>Làng nghề Phú Vinh thuộc xã Phú Nghĩa, huyện Chương Mỹ, Hà Nội là một trong những làng nghề mây tre đan lâu đời và nổi tiếng nhất Việt Nam với hơn 400 năm lịch sử.</p><p>Tại đây, các nghệ nhân vẫn giữ nguyên kỹ thuật đan lát truyền thống được truyền qua nhiều thế hệ, tạo ra những sản phẩm mây tre tinh xảo được đánh giá cao cả trong nước và quốc tế.</p>");
            article2.setThumbnail("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800");
            article2.setAuthor("Gói Mây Vietnam");
            article2.setPublishedAt(LocalDateTime.of(2026, 1, 8, 10, 0));
            article2.setFeatured(false);
            article2.setPublished(true);
            article2.setCategory(langNghe);
            articleRepository.save(article2);
            
            // Article 3 - Nghệ nhân
            Article article3 = new Article();
            article3.setTitle("Nghệ nhân Nguyễn Văn Trung và những chiếc giỏ mây mang hồn Việt");
            article3.setSlug("nghe-nhan-nguyen-van-trung");
            article3.setSummary("Câu chuyện về người nghệ nhân 70 tuổi vẫn miệt mài gìn giữ nghề đan mây truyền thống của cha ông.");
            article3.setContent("<p>Ở tuổi 70, nghệ nhân Nguyễn Văn Trung vẫn miệt mài bên khung đan mỗi ngày. Đôi tay khéo léo của ông đã tạo nên hàng nghìn sản phẩm mây tre tinh xảo trong suốt hơn 50 năm theo nghề.</p><p>\"Nghề đan lát không chỉ là sinh kế, mà còn là cách tôi gìn giữ di sản văn hóa của cha ông\", ông Trung chia sẻ.</p>");
            article3.setThumbnail("https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800");
            article3.setAuthor("Gói Mây Vietnam");
            article3.setPublishedAt(LocalDateTime.of(2026, 1, 5, 10, 0));
            article3.setFeatured(false);
            article3.setPublished(true);
            article3.setCategory(ngheNhan);
            articleRepository.save(article3);
            
            // Article 4 - Đặc sản
            Article article4 = new Article();
            article4.setTitle("Đặc sản vùng miền - Tinh túy ẩm thực Việt trong mỗi set quà");
            article4.setSlug("dac-san-vung-mien");
            article4.setSummary("Từ cà phê Đắk Lắk đến chè Thái Nguyên, từ mắm Phú Quốc đến kẹo dừa Bến Tre - hương vị Việt trong từng set quà.");
            article4.setContent("<p>Mỗi vùng miền Việt Nam đều có những đặc sản độc đáo, mang đậm hương vị và văn hóa địa phương. Gói Mây tự hào kết hợp những tinh túy này trong các set quà tặng.</p><p>Từ cà phê Đắk Lắk thơm nồng, chè Thái Nguyên thanh mát, đến mắm Phú Quốc đậm đà và kẹo dừa Bến Tre ngọt ngào - mỗi sản phẩm đều là câu chuyện về văn hóa ẩm thực Việt Nam.</p>");
            article4.setThumbnail("https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800");
            article4.setAuthor("Gói Mây Vietnam");
            article4.setPublishedAt(LocalDateTime.of(2026, 1, 3, 9, 0));
            article4.setFeatured(false);
            article4.setPublished(true);
            article4.setCategory(dacSan);
            articleRepository.save(article4);
            
            // Article 5 - Làng cói Kim Sơn
            Article article5 = new Article();
            article5.setTitle("Làng cói Kim Sơn (Ninh Bình) - Nơi sản sinh những sản phẩm cói tinh tế");
            article5.setSlug("lang-coi-kim-son");
            article5.setSummary("Kim Sơn là vùng đất nổi tiếng với nghề dệt cói truyền thống, tạo ra những sản phẩm thủ công mỹ nghệ độc đáo.");
            article5.setContent("<p>Làng nghề cói Kim Sơn thuộc huyện Kim Sơn, tỉnh Ninh Bình, nổi tiếng với nghề trồng và chế biến cói từ hàng trăm năm nay.</p><p>Từ những sợi cói tự nhiên, người dân nơi đây đã tạo ra vô vàn sản phẩm thủ công mỹ nghệ: chiếu, túi xách, hộp đựng, giỏ... xuất khẩu đi khắp thế giới.</p>");
            article5.setThumbnail("https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800");
            article5.setAuthor("Gói Mây Vietnam");
            article5.setPublishedAt(LocalDateTime.of(2025, 12, 28, 10, 0));
            article5.setFeatured(false);
            article5.setPublished(true);
            article5.setCategory(langNghe);
            articleRepository.save(article5);
            
            // Article 6 - Set quà Tết
            Article article6 = new Article();
            article6.setTitle("Set quà Tết 2026 - Gói trọn yêu thương, đậm đà bản sắc");
            article6.setSlug("set-qua-tet-2026");
            article6.setSummary("Bộ sưu tập quà Tết với giỏ mây thủ công kết hợp đặc sản các vùng miền - món quà ý nghĩa dành tặng người thân.");
            article6.setContent("<p>Tết Nguyên đán 2026 đang đến gần, Gói Mây ra mắt bộ sưu tập quà Tết đặc biệt với sự kết hợp hoàn hảo giữa giỏ mây thủ công truyền thống và đặc sản các vùng miền.</p><p>Mỗi set quà không chỉ là món quà vật chất, mà còn gửi gắm tình cảm và văn hóa Việt Nam đến người nhận.</p>");
            article6.setThumbnail("https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800");
            article6.setAuthor("Gói Mây Vietnam");
            article6.setPublishedAt(LocalDateTime.of(2025, 12, 15, 10, 0));
            article6.setFeatured(false);
            article6.setPublished(true);
            article6.setCategory(setQua);
            articleRepository.save(article6);
            
            // Article 7 - Văn hóa
            Article article7 = new Article();
            article7.setTitle("Nghề đan lát - Di sản văn hóa phi vật thể cần được gìn giữ");
            article7.setSlug("nghe-dan-lat-di-san");
            article7.setSummary("Nghề đan lát truyền thống không chỉ là sinh kế mà còn là di sản văn hóa quý báu của dân tộc Việt Nam.");
            article7.setContent("<p>Nghề đan lát (mây, tre, cói) là một trong những nghề thủ công truyền thống lâu đời nhất của người Việt, gắn liền với đời sống nông nghiệp và văn hóa làng xã.</p><p>Ngày nay, trước sự phát triển của công nghiệp hóa, nghề đan lát đang dần mai một. Việc bảo tồn và phát triển nghề thủ công này là trách nhiệm của cả cộng đồng.</p>");
            article7.setThumbnail("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800");
            article7.setAuthor("Gói Mây Vietnam");
            article7.setPublishedAt(LocalDateTime.of(2025, 12, 10, 10, 0));
            article7.setFeatured(false);
            article7.setPublished(true);
            article7.setCategory(vanHoa);
            articleRepository.save(article7);
            
            // Article 8 - Bền vững
            Article article8 = new Article();
            article8.setTitle("Bền vững từ gốc rễ - Triết lý xanh của Gói Mây");
            article8.setSlug("ben-vung-tu-goc-re");
            article8.setSummary("Cam kết sử dụng 100% nguyên liệu tự nhiên, có thể tái chế và phân hủy sinh học, góp phần bảo vệ môi trường.");
            article8.setContent("<p>Tại Gói Mây, bền vững không chỉ là xu hướng mà là triết lý kinh doanh cốt lõi. Tất cả sản phẩm của chúng tôi được làm từ nguyên liệu tự nhiên: mây, tre, cói, lá chuối...</p><p>Những nguyên liệu này không chỉ thân thiện với môi trường mà còn có thể tái chế và phân hủy sinh học, giảm thiểu rác thải nhựa và góp phần bảo vệ hành tinh xanh.</p>");
            article8.setThumbnail("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800");
            article8.setAuthor("Gói Mây Vietnam");
            article8.setPublishedAt(LocalDateTime.of(2025, 12, 5, 10, 0));
            article8.setFeatured(false);
            article8.setPublished(true);
            article8.setCategory(vanHoa);
            articleRepository.save(article8);
        }
    }
    
    private void initProducts() {
        if (productRepository.count() == 0) {
            // Set quà Tết An Khang
            Product product1 = new Product();
            product1.setName("Set quà Tết An Khang - Giỏ mây tre đan");
            product1.setSlug("set-qua-tet-an-khang");
            product1.setDescription("Giỏ mây tre đan thủ công kết hợp đặc sản: Trà Thái Nguyên, Cà phê Đắk Lắk, Bánh đậu xanh Hải Dương");
            product1.setPrice(new BigDecimal("850000"));
            product1.setThumbnail("https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=400");
            product1.setProductCategory("Set quà Tết");
            product1.setStock(50);
            product1.setActive(true);
            productRepository.save(product1);
            
            // Set quà Phú Quý
            Product product2 = new Product();
            product2.setName("Set quà Phú Quý - Hộp tre truyền thống");
            product2.setSlug("set-qua-phu-quy");
            product2.setDescription("Hộp tre khắc hoa văn truyền thống, đựng: Mật ong Hưng Yên, Hạt điều Bình Phước, Trà sen Tây Hồ");
            product2.setPrice(new BigDecimal("1250000"));
            product2.setSalePrice(new BigDecimal("999000"));
            product2.setThumbnail("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400");
            product2.setProductCategory("Set quà Tết");
            product2.setStock(30);
            product2.setActive(true);
            productRepository.save(product2);
            
            // Giỏ mây Phú Vinh
            Product product3 = new Product();
            product3.setName("Giỏ mây đan Phú Vinh - Size L");
            product3.setSlug("gio-may-dan-phu-vinh-l");
            product3.setDescription("Giỏ mây đan thủ công từ làng nghề Phú Vinh, Hà Nội - 400 năm truyền thống");
            product3.setPrice(new BigDecimal("450000"));
            product3.setThumbnail("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400");
            product3.setProductCategory("Thủ công mỹ nghệ");
            product3.setStock(80);
            product3.setActive(true);
            productRepository.save(product3);
            
            // Túi cói Kim Sơn
            Product product4 = new Product();
            product4.setName("Túi cói Kim Sơn - Handmade");
            product4.setSlug("tui-coi-kim-son");
            product4.setDescription("Túi cói đan tay từ làng nghề Kim Sơn, Ninh Bình");
            product4.setPrice(new BigDecimal("280000"));
            product4.setThumbnail("https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400");
            product4.setProductCategory("Thủ công mỹ nghệ");
            product4.setStock(100);
            product4.setActive(true);
            productRepository.save(product4);
            
            // Set đặc sản Đà Lạt
            Product product5 = new Product();
            product5.setName("Set đặc sản Đà Lạt - Hộp gỗ tre");
            product5.setSlug("set-dac-san-da-lat");
            product5.setDescription("Mứt dâu tây, Atiso sấy, Trà hoa cúc Đà Lạt trong hộp gỗ tre khắc laser");
            product5.setPrice(new BigDecimal("650000"));
            product5.setThumbnail("https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400");
            product5.setProductCategory("Đặc sản vùng miền");
            product5.setStock(60);
            product5.setActive(true);
            productRepository.save(product5);
            
            // Set đặc sản Tây Bắc
            Product product6 = new Product();
            product6.setName("Set đặc sản Tây Bắc - Giỏ mây");
            product6.setSlug("set-dac-san-tay-bac");
            product6.setDescription("Mật ong rừng, Thịt trâu gác bếp, Chè Shan tuyết trong giỏ mây thủ công");
            product6.setPrice(new BigDecimal("720000"));
            product6.setThumbnail("https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400");
            product6.setProductCategory("Đặc sản vùng miền");
            product6.setStock(45);
            product6.setActive(true);
            productRepository.save(product6);
            
            // Set quà Doanh nghiệp
            Product product7 = new Product();
            product7.setName("Set quà Doanh nghiệp Premium");
            product7.setSlug("set-qua-doanh-nghiep-premium");
            product7.setDescription("Bộ quà cao cấp với hộp tre khắc logo doanh nghiệp, đặc sản và sản phẩm thủ công");
            product7.setPrice(new BigDecimal("2500000"));
            product7.setThumbnail("https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400");
            product7.setProductCategory("Quà doanh nghiệp");
            product7.setStock(20);
            product7.setActive(true);
            productRepository.save(product7);
            
            // Bộ ấm trà tre
            Product product8 = new Product();
            product8.setName("Bộ ấm trà tre nứa thủ công");
            product8.setSlug("bo-am-tra-tre-nua");
            product8.setDescription("Ấm trà và 6 chén làm từ tre nứa tự nhiên, thân thiện môi trường");
            product8.setPrice(new BigDecimal("380000"));
            product8.setThumbnail("https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400");
            product8.setProductCategory("Thủ công mỹ nghệ");
            product8.setStock(70);
            product8.setActive(true);
            productRepository.save(product8);
        }
    }

    /** Dữ liệu mẫu cho 33 tài khoản giống người thật (chỉ dùng khi seed). */
    private static final class FakeUserData {
        final String fullName;
        final String phone;
        final String address;
        final LocalDate birthDate;
        final String gender;

        FakeUserData(String fullName, String phone, String address, LocalDate birthDate, String gender) {
            this.fullName = fullName;
            this.phone = phone;
            this.address = address;
            this.birthDate = birthDate;
            this.gender = gender;
        }

        static List<FakeUserData> list33() {
            return List.of(
                    new FakeUserData("Nguyễn Minh Tuấn", "0912345001", "123 Láng Hạ, Đống Đa, Hà Nội", LocalDate.of(1992, 3, 15), "MALE"),
                    new FakeUserData("Trần Thị Hương", "0987654002", "45 Nguyễn Huệ, Quận 1, TP.HCM", LocalDate.of(1995, 7, 22), "FEMALE"),
                    new FakeUserData("Lê Văn Đức", "0901234503", "78 Trần Phú, Hải Châu, Đà Nẵng", LocalDate.of(1988, 11, 8), "MALE"),
                    new FakeUserData("Phạm Thị Mai", "0913456004", "22 Lê Lợi, Thành phố Huế", LocalDate.of(1997, 1, 30), "FEMALE"),
                    new FakeUserData("Hoàng Minh Quân", "0924567005", "56 Bà Triệu, Ninh Kiều, Cần Thơ", LocalDate.of(1990, 5, 12), "MALE"),
                    new FakeUserData("Vũ Thị Lan", "0935678006", "88 Hai Bà Trưng, Hoàn Kiếm, Hà Nội", LocalDate.of(1993, 9, 4), "FEMALE"),
                    new FakeUserData("Đặng Văn Hùng", "0946789007", "15 Ngô Quyền, Hải Phòng", LocalDate.of(1985, 2, 18), "MALE"),
                    new FakeUserData("Bùi Thị Nga", "0957890008", "34 Lý Tự Trọng, Thanh Khê, Đà Nẵng", LocalDate.of(1998, 6, 25), "FEMALE"),
                    new FakeUserData("Đỗ Minh Khôi", "0968901009", "67 Nguyễn Văn Linh, Ninh Kiều, Cần Thơ", LocalDate.of(1991, 12, 10), "MALE"),
                    new FakeUserData("Ngô Thị Hà", "0979012010", "90 Phan Chu Trinh, Quận 1, TP.HCM", LocalDate.of(1994, 4, 7), "FEMALE"),
                    new FakeUserData("Dương Văn Thành", "0980123011", "12 Trần Hưng Đạo, Quận 5, TP.HCM", LocalDate.of(1989, 8, 19), "MALE"),
                    new FakeUserData("Lý Thị Thảo", "0991234012", "23 Lê Duẩn, Đống Đa, Hà Nội", LocalDate.of(1996, 10, 3), "FEMALE"),
                    new FakeUserData("Trương Minh Đạt", "0902345013", "45 Hoàng Văn Thụ, Phú Nhuận, TP.HCM", LocalDate.of(1992, 2, 28), "MALE"),
                    new FakeUserData("Chu Thị Ngọc", "0913456024", "78 Nguyễn Trãi, Thanh Xuân, Hà Nội", LocalDate.of(1997, 6, 14), "FEMALE"),
                    new FakeUserData("Tạ Văn Bình", "0924567015", "56 Cầu Giấy, Cầu Giấy, Hà Nội", LocalDate.of(1987, 11, 21), "MALE"),
                    new FakeUserData("Hồ Thị Kim", "0935678026", "89 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM", LocalDate.of(1995, 3, 9), "FEMALE"),
                    new FakeUserData("Phan Văn Cường", "0946789037", "11 Lý Thường Kiệt, Đà Nẵng", LocalDate.of(1990, 7, 16), "MALE"),
                    new FakeUserData("Võ Thị Diễm", "0957890048", "32 Hùng Vương, Nha Trang", LocalDate.of(1993, 1, 5), "FEMALE"),
                    new FakeUserData("Tăng Minh Phong", "0968901059", "44 Trần Hưng Đạo, Vũng Tàu", LocalDate.of(1988, 9, 27), "MALE"),
                    new FakeUserData("Cao Thị Yến", "0979012060", "66 Lê Hồng Phong, Quận 10, TP.HCM", LocalDate.of(1996, 5, 11), "FEMALE"),
                    new FakeUserData("Lâm Văn Tâm", "0980123071", "77 Nguyễn Thị Minh Khai, Quận 3, TP.HCM", LocalDate.of(1991, 12, 30), "MALE"),
                    new FakeUserData("Kiều Thị Hằng", "0991234082", "88 Điện Biên Phủ, Bình Thạnh, TP.HCM", LocalDate.of(1994, 4, 18), "FEMALE"),
                    new FakeUserData("Hà Minh Tuấn", "0902345093", "99 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM", LocalDate.of(1986, 8, 2), "MALE"),
                    new FakeUserData("Tô Thị Linh", "0913456104", "21 Cộng Hòa, Tân Bình, TP.HCM", LocalDate.of(1998, 10, 23), "FEMALE"),
                    new FakeUserData("Sơn Văn Khoa", "0924567115", "33 Âu Cơ, Tây Hồ, Hà Nội", LocalDate.of(1989, 2, 14), "MALE"),
                    new FakeUserData("Quách Thị Trang", "0935678126", "55 Tô Hiến Thành, Hai Bà Trưng, Hà Nội", LocalDate.of(1992, 6, 7), "FEMALE"),
                    new FakeUserData("Mai Văn Lực", "0946789137", "77 Giảng Võ, Ba Đình, Hà Nội", LocalDate.of(1985, 11, 19), "MALE"),
                    new FakeUserData("Đinh Thị Phương", "0957890148", "12 Kim Mã, Ba Đình, Hà Nội", LocalDate.of(1995, 9, 1), "FEMALE"),
                    new FakeUserData("Giang Minh Hoàng", "0968901159", "34 Đội Cấn, Ba Đình, Hà Nội", LocalDate.of(1990, 4, 26), "MALE"),
                    new FakeUserData("Khổng Thị Hoa", "0979012160", "56 Trường Chinh, Đống Đa, Hà Nội", LocalDate.of(1993, 7, 12), "FEMALE"),
                    new FakeUserData("La Văn Sơn", "0980123171", "89 Tây Sơn, Đống Đa, Hà Nội", LocalDate.of(1987, 1, 8), "MALE"),
                    new FakeUserData("Mạc Thị Uyên", "0991234182", "11 Nguyễn Chí Thanh, Đống Đa, Hà Nội", LocalDate.of(1996, 12, 15), "FEMALE"),
                    new FakeUserData("Nghiêm Minh Thắng", "0902345193", "22 Lạc Long Quân, Tây Hồ, Hà Nội", LocalDate.of(1991, 3, 22), "MALE"),
                    new FakeUserData("Ôn Thị Vy", "0913456204", "45 Xuân Thủy, Cầu Giấy, Hà Nội", LocalDate.of(1994, 8, 6), "FEMALE")
            );
        }
    }
}
