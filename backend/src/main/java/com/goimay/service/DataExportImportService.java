package com.goimay.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.goimay.dto.*;
import com.goimay.model.*;
import com.goimay.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataExportImportService {
    
    private final SiteSettingService siteSettingService;
    private final ProductService productService;
    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final ProductCategoryService productCategoryService;
    private final ProductRepository productRepository;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductCategoryRepository productCategoryRepository;
    
    // Initialize ObjectMapper với cấu hình phù hợp
    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
    
    private static final String DATA_DIR = "data";
    private static final String SITE_SETTINGS_FILE = "site-settings.json";
    private static final String ALL_DATA_FILE = "all-data.json";
    
    /**
     * Export site settings ra file JSON để commit vào git
     */
    public void exportSiteSettings() {
        try {
            String projectRoot = System.getProperty("user.dir");
            log.info("Current working directory: {}", projectRoot);
            
            Path currentDir = Paths.get(projectRoot).toAbsolutePath();
            Path dataDir = currentDir.resolve(DATA_DIR);
            
            // Nếu đang ở trong thư mục backend, data sẽ ở backend/data
            // Nếu đang ở root project, data sẽ ở backend/data
            if (currentDir.getFileName().toString().equals("backend")) {
                // Đang ở trong backend, tạo data ở đây
                dataDir = currentDir.resolve(DATA_DIR);
            } else {
                // Đang ở root, tìm thư mục backend
                Path backendDir = currentDir.resolve("backend");
                if (Files.exists(backendDir) && Files.isDirectory(backendDir)) {
                    dataDir = backendDir.resolve(DATA_DIR);
                } else {
                    // Fallback: tạo ở thư mục hiện tại
                    dataDir = currentDir.resolve(DATA_DIR);
                }
            }
            
            Files.createDirectories(dataDir);
            log.info("Data directory: {}", dataDir.toAbsolutePath());
            
            Path settingsFile = dataDir.resolve(SITE_SETTINGS_FILE);
            
            List<SiteSettingDTO> settings = siteSettingService.getAll();
            log.info("Exporting {} settings to: {}", settings.size(), settingsFile.toAbsolutePath());
            
            ObjectMapper mapper = createObjectMapper();
            mapper.writerWithDefaultPrettyPrinter().writeValue(settingsFile.toFile(), settings);
            
            log.info("✅ Đã export {} site settings vào file: {}", settings.size(), settingsFile.toAbsolutePath());
        } catch (Exception e) {
            log.error("❌ Lỗi khi export site settings", e);
            e.printStackTrace();
            throw new RuntimeException("Không thể export site settings: " + e.getMessage(), e);
        }
    }
    
    /**
     * Import site settings từ file JSON khi khởi động ứng dụng
     */
    public void importSiteSettings() {
        try {
            Path settingsFile = getDataDirectory().resolve(SITE_SETTINGS_FILE);
            
            if (!Files.exists(settingsFile)) {
                log.info("Không tìm thấy file site-settings.json, bỏ qua import");
                return;
            }
            
            ObjectMapper mapper = createObjectMapper();
            List<SiteSettingDTO> settings = mapper.readValue(
                settingsFile.toFile(),
                mapper.getTypeFactory().constructCollectionType(List.class, SiteSettingDTO.class)
            );
            
            if (settings != null && !settings.isEmpty()) {
                // Chỉ import nếu database chưa có dữ liệu
                if (siteSettingService.getAll().isEmpty()) {
                    siteSettingService.saveAll(settings);
                    log.info("Đã import {} site settings từ file", settings.size());
                } else {
                    log.info("Database đã có dữ liệu, bỏ qua import. Để cập nhật, hãy xóa dữ liệu cũ trước.");
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi import site settings", e);
            // Không throw exception để không làm gián đoạn quá trình khởi động
        }
    }
    
    /**
     * Sync: Export dữ liệu hiện tại từ database ra file
     * Gọi sau khi admin thay đổi dữ liệu để đồng bộ vào code
     */
    public void syncToFile() {
        exportSiteSettings();
    }
    
    /**
     * Export tất cả dữ liệu (site settings, categories, products, articles) ra file JSON
     */
    @Transactional(readOnly = true)
    public void exportAllData() {
        try {
            Path dataDir = getDataDirectory();
            Files.createDirectories(dataDir);
            log.info("Data directory: {}", dataDir.toAbsolutePath());
            
            Path allDataFile = dataDir.resolve(ALL_DATA_FILE);
            
            // Lấy tất cả dữ liệu với xử lý null an toàn
            List<SiteSettingDTO> siteSettings = siteSettingService.getAll();
            if (siteSettings == null) siteSettings = List.of();
            
            List<CategoryDTO> categories = categoryService.getAllCategories();
            if (categories == null) categories = List.of();
            
            List<ProductCategoryDTO> productCategories = productCategoryService.getAllCategories();
            if (productCategories == null) productCategories = List.of();
            
            // Lấy tất cả articles và products (không phân trang)
            List<ArticleDTO> articles = List.of();
            try {
                // Sử dụng service method để convert, đảm bảo transaction và lazy loading được xử lý đúng
                List<Article> allArticles = articleRepository.findAll();
                articles = allArticles.stream()
                        .map(article -> {
                            try {
                                return articleService.getArticleById(article.getId());
                            } catch (Exception e) {
                                log.warn("Lỗi khi convert article {}: {}", article.getId(), e.getMessage());
                                // Fallback: tự convert nếu service method fail
                                try {
                                    if (article.getCategory() != null) {
                                        article.getCategory().getName(); // Trigger lazy load
                                    }
                                    return convertArticleToDTO(article);
                                } catch (Exception e2) {
                                    log.error("Lỗi khi fallback convert article {}: {}", article.getId(), e2.getMessage());
                                    return null;
                                }
                            }
                        })
                        .filter(dto -> dto != null)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.error("Lỗi khi export articles", e);
                e.printStackTrace();
            }
            
            List<ProductDTO> products = List.of();
            try {
                // Sử dụng service method để convert, đảm bảo transaction và lazy loading được xử lý đúng
                List<Product> allProducts = productRepository.findAll();
                products = allProducts.stream()
                        .map(product -> {
                            try {
                                return productService.getProductById(product.getId());
                            } catch (Exception e) {
                                log.warn("Lỗi khi convert product {}: {}", product.getId(), e.getMessage());
                                // Fallback: tự convert nếu service method fail
                                try {
                                    if (product.getImages() != null) {
                                        product.getImages().size(); // Trigger lazy load
                                    }
                                    return convertProductToDTO(product);
                                } catch (Exception e2) {
                                    log.error("Lỗi khi fallback convert product {}: {}", product.getId(), e2.getMessage());
                                    return null;
                                }
                            }
                        })
                        .filter(dto -> dto != null)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.error("Lỗi khi export products", e);
                e.printStackTrace();
            }
            
            DataExportDTO exportData = new DataExportDTO(
                    siteSettings,
                    categories,
                    productCategories,
                    articles,
                    products
            );
            
            log.info("Exporting data to: {}", allDataFile.toAbsolutePath());
            
            // Kiểm tra quyền ghi file
            if (!Files.isWritable(dataDir) && Files.exists(dataDir)) {
                throw new RuntimeException("Không có quyền ghi vào thư mục: " + dataDir.toAbsolutePath());
            }
            
            // Sử dụng ObjectMapper được cấu hình đúng
            ObjectMapper mapper = createObjectMapper();
            mapper.writerWithDefaultPrettyPrinter().writeValue(allDataFile.toFile(), exportData);
            
            log.info("✅ Đã export tất cả dữ liệu vào file: {}", allDataFile.toAbsolutePath());
            log.info("   - Site Settings: {}", siteSettings.size());
            log.info("   - Categories: {}", categories.size());
            log.info("   - Product Categories: {}", productCategories.size());
            log.info("   - Articles: {}", articles.size());
            log.info("   - Products: {}", products.size());
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi export tất cả dữ liệu", e);
            e.printStackTrace();
            // Log chi tiết hơn
            if (e.getCause() != null) {
                log.error("   Cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Không thể export dữ liệu: " + e.getMessage() + 
                    (e.getCause() != null ? " - " + e.getCause().getMessage() : ""), e);
        }
    }
    
    /**
     * Import tất cả dữ liệu từ file JSON khi khởi động ứng dụng
     */
    @Transactional
    public void importAllData() {
        try {
            Path allDataFile = getDataDirectory().resolve(ALL_DATA_FILE);
            
            if (!Files.exists(allDataFile)) {
                log.info("Không tìm thấy file all-data.json, bỏ qua import");
                return;
            }
            
            ObjectMapper mapper = createObjectMapper();
            DataExportDTO importData = mapper.readValue(allDataFile.toFile(), DataExportDTO.class);
            
            if (importData == null) {
                log.info("File all-data.json rỗng, bỏ qua import");
                return;
            }
            
            // Chỉ import nếu database trống
            boolean hasData = !categoryRepository.findAll().isEmpty() || 
                            !productRepository.findAll().isEmpty() ||
                            !articleRepository.findAll().isEmpty();
            
            if (hasData) {
                log.info("Database đã có dữ liệu, bỏ qua import. Để cập nhật, hãy xóa dữ liệu cũ trước.");
                return;
            }
            
            // Import Categories trước
            if (importData.getCategories() != null) {
                for (CategoryDTO dto : importData.getCategories()) {
                    Category category = new Category();
                    category.setName(dto.getName());
                    category.setSlug(dto.getSlug());
                    category.setDescription(dto.getDescription());
                    categoryRepository.save(category);
                }
                log.info("Đã import {} categories", importData.getCategories().size());
            }
            
            // Import Product Categories
            if (importData.getProductCategories() != null) {
                for (ProductCategoryDTO dto : importData.getProductCategories()) {
                    ProductCategory pc = new ProductCategory();
                    pc.setName(dto.getName());
                    pc.setSlug(dto.getSlug());
                    pc.setDescription(dto.getDescription());
                    pc.setIcon(dto.getIcon());
                    pc.setDisplayOrder(dto.getDisplayOrder());
                    pc.setActive(dto.isActive());
                    productCategoryRepository.save(pc);
                }
                log.info("Đã import {} product categories", importData.getProductCategories().size());
            }
            
            // Import Articles (sau Categories)
            if (importData.getArticles() != null) {
                for (ArticleDTO dto : importData.getArticles()) {
                    Article article = new Article();
                    article.setTitle(dto.getTitle());
                    article.setSlug(dto.getSlug());
                    article.setSummary(dto.getSummary());
                    article.setContent(dto.getContent());
                    article.setThumbnail(dto.getThumbnail());
                    article.setAuthor(dto.getAuthor());
                    article.setPublishedAt(dto.getPublishedAt());
                    article.setFeatured(dto.isFeatured());
                    article.setPublished(dto.isPublished());
                    
                    if (dto.getCategoryId() != null) {
                        Category category = categoryRepository.findById(dto.getCategoryId())
                                .orElse(null);
                        article.setCategory(category);
                    }
                    
                    articleRepository.save(article);
                }
                log.info("Đã import {} articles", importData.getArticles().size());
            }
            
            // Import Products (sau Product Categories)
            if (importData.getProducts() != null) {
                for (ProductDTO dto : importData.getProducts()) {
                    Product product = new Product();
                    product.setName(dto.getName());
                    product.setSlug(dto.getSlug());
                    product.setDescription(dto.getDescription());
                    product.setPrice(dto.getPrice());
                    product.setSalePrice(dto.getSalePrice());
                    product.setThumbnail(dto.getThumbnail());
                    product.setProductCategory(dto.getProductCategory());
                    product.setStock(dto.getStock());
                    product.setActive(dto.isActive());
                    
                    Product savedProduct = productRepository.save(product);
                    
                    // Import Product Images
                    if (dto.getImages() != null && !dto.getImages().isEmpty()) {
                        for (int i = 0; i < dto.getImages().size(); i++) {
                            ProductImage image = new ProductImage();
                            image.setProduct(savedProduct);
                            image.setUrl(dto.getImages().get(i));
                            image.setDisplayOrder(i);
                            savedProduct.getImages().add(image);
                        }
                        productRepository.save(savedProduct);
                    }
                }
                log.info("Đã import {} products", importData.getProducts().size());
            }
            
            log.info("✅ Đã import tất cả dữ liệu từ file");
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi import tất cả dữ liệu", e);
            // Không throw exception để không làm gián đoạn quá trình khởi động
        }
    }
    
    private Path getDataDirectory() {
        String projectRoot = System.getProperty("user.dir");
        Path currentDir = Paths.get(projectRoot).toAbsolutePath();
        
        if (currentDir.getFileName().toString().equals("backend")) {
            return currentDir.resolve(DATA_DIR);
        } else {
            Path backendDir = currentDir.resolve("backend");
            if (Files.exists(backendDir) && Files.isDirectory(backendDir)) {
                return backendDir.resolve(DATA_DIR);
            } else {
                return currentDir.resolve(DATA_DIR);
            }
        }
    }
    
    private ArticleDTO convertArticleToDTO(Article article) {
        if (article == null) return null;
        
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setSummary(article.getSummary());
        dto.setContent(article.getContent());
        dto.setThumbnail(article.getThumbnail());
        dto.setAuthor(article.getAuthor());
        dto.setPublishedAt(article.getPublishedAt());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setFeatured(article.isFeatured());
        dto.setPublished(article.isPublished());
        
        if (article.getCategory() != null) {
            dto.setCategoryName(article.getCategory().getName());
            dto.setCategoryId(article.getCategory().getId());
        }
        
        return dto;
    }
    
    private ProductDTO convertProductToDTO(Product product) {
        if (product == null) return null;
        
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setSalePrice(product.getSalePrice());
        dto.setThumbnail(product.getThumbnail());
        dto.setProductCategory(product.getProductCategory());
        dto.setStock(product.getStock());
        dto.setActive(product.isActive());
        
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            dto.setImages(product.getImages().stream()
                    .filter(img -> img != null && img.getUrl() != null)
                    .sorted((a, b) -> {
                        int orderA = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
                        int orderB = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
                        int orderCompare = Integer.compare(orderA, orderB);
                        if (orderCompare != 0) return orderCompare;
                        long idA = a.getId() != null ? a.getId() : 0;
                        long idB = b.getId() != null ? b.getId() : 0;
                        return Long.compare(idA, idB);
                    })
                    .map(ProductImage::getUrl)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    /**
     * Sync tất cả dữ liệu vào file
     */
    public void syncAllToFile() {
        exportSiteSettings();
        exportAllData();
    }
}
