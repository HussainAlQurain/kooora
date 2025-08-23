package com.kooora.app.service;

import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling file uploads
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:5242880}") // 5MB default
    private long maxFileSize;

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
        "jpg", "jpeg", "png", "gif", "bmp", "webp"
    );

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"
    );

    /**
     * Upload a file and return the file URL
     */
    public String uploadFile(MultipartFile file, String category) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        validateFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, category);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = FilenameUtils.getExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

        // Copy file to upload directory
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return the public URL
        String fileUrl = "/uploads/" + category + "/" + uniqueFilename;
        logger.info("File uploaded successfully: {}", fileUrl);
        
        return fileUrl;
    }

    /**
     * Upload team logo
     */
    public String uploadTeamLogo(MultipartFile file) throws IOException {
        return uploadFile(file, "teams");
    }

    /**
     * Upload player photo
     */
    public String uploadPlayerPhoto(MultipartFile file) throws IOException {
        return uploadFile(file, "players");
    }

    /**
     * Upload country flag
     */
    public String uploadCountryFlag(MultipartFile file) throws IOException {
        return uploadFile(file, "countries");
    }

    /**
     * Upload league logo
     */
    public String uploadLeagueLogo(MultipartFile file) throws IOException {
        return uploadFile(file, "leagues");
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        // Check file size
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                "File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + " MB"
            );
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Filename is null");
        }

        String extension = FilenameUtils.getExtension(originalFilename).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                "File extension not allowed. Allowed extensions: " + ALLOWED_IMAGE_EXTENSIONS
            );
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "File type not allowed. Allowed types: " + ALLOWED_MIME_TYPES
            );
        }
    }

    /**
     * Delete a file
     */
    public boolean deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
                return false;
            }

            // Convert URL to file path
            String relativePath = fileUrl.substring("/uploads/".length());
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("File deleted successfully: {}", fileUrl);
                return true;
            }
        } catch (IOException e) {
            logger.error("Error deleting file: {}", fileUrl, e);
        }
        return false;
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return false;
        }

        String relativePath = fileUrl.substring("/uploads/".length());
        Path filePath = Paths.get(uploadDir, relativePath);
        return Files.exists(filePath);
    }

    /**
     * Get file size in bytes
     */
    public long getFileSize(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
                return 0;
            }

            String relativePath = fileUrl.substring("/uploads/".length());
            Path filePath = Paths.get(uploadDir, relativePath);
            
            if (Files.exists(filePath)) {
                return Files.size(filePath);
            }
        } catch (IOException e) {
            logger.error("Error getting file size: {}", fileUrl, e);
        }
        return 0;
    }
}
