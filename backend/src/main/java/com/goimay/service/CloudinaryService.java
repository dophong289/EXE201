package com.goimay.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    /**
     * Upload ảnh lên Cloudinary
     * @param file File ảnh cần upload
     * @return URL của ảnh trên Cloudinary
     * @throws IOException Nếu có lỗi khi upload
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Tạo public_id unique cho ảnh
        String publicId = "goimay/" + UUID.randomUUID().toString();
        
        // Upload lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "public_id", publicId,
                "folder", "goimay",
                "resource_type", "image"
            )
        );
        
        // Lấy URL của ảnh (secure_url = https)
        String imageUrl = (String) uploadResult.get("secure_url");
        
        log.info("✅ Uploaded image to Cloudinary: {}", imageUrl);
        
        return imageUrl;
    }
    
    /**
     * Xóa ảnh từ Cloudinary (nếu cần)
     * @param publicId Public ID của ảnh cần xóa
     */
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("✅ Deleted image from Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.error("❌ Failed to delete image from Cloudinary: {}", publicId, e);
        }
    }
}
