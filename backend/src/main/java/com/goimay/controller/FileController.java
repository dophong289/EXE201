package com.goimay.controller;

import com.goimay.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileController {
    
    private final CloudinaryService cloudinaryService;
    private final Path uploadPath;
    
    public FileController(
            CloudinaryService cloudinaryService,
            @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.cloudinaryService = cloudinaryService;
        // Lưu trong thư mục project để có thể commit vào git và đồng bộ giữa các máy
        String projectRoot = System.getProperty("user.dir");
        Path currentDir = Paths.get(projectRoot).toAbsolutePath();
        
        // Nếu đang ở trong thư mục backend, uploads sẽ ở backend/uploads
        // Nếu đang ở root project, uploads sẽ ở backend/uploads
        if (currentDir.getFileName().toString().equals("backend")) {
            this.uploadPath = currentDir.resolve(uploadDir).toAbsolutePath().normalize();
        } else {
            Path backendDir = currentDir.resolve("backend");
            if (Files.exists(backendDir) && Files.isDirectory(backendDir)) {
                this.uploadPath = backendDir.resolve(uploadDir).toAbsolutePath().normalize();
            } else {
                this.uploadPath = currentDir.resolve(uploadDir).toAbsolutePath().normalize();
            }
        }
        
        try {
            Files.createDirectories(this.uploadPath);
            System.out.println("Upload directory: " + this.uploadPath.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo thư mục upload: " + this.uploadPath, e);
        }
    }
    
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File không được để trống"));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Chỉ chấp nhận file ảnh"));
            }
            
            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File không được vượt quá 5MB"));
            }
            
            // Upload lên Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file);
            
            // Lấy filename từ URL Cloudinary (phần cuối của URL)
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            
            return ResponseEntity.ok(Map.of(
                "url", imageUrl,
                "filename", filename,
                "message", "Upload thành công"
            ));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi upload file: " + e.getMessage()));
        }
    }
    
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            Path filePath = this.uploadPath.resolve(filename).normalize();
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] imageBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType != null ? contentType : "image/jpeg")
                    .body(imageBytes);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
