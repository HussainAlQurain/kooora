package com.kooora.app.controller;

import com.kooora.app.service.FileUploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling file uploads and downloads
 * 
 * @author Kooora Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Upload team logo
     */
    @PostMapping("/teams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadTeamLogo(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "team logo", () -> fileUploadService.uploadTeamLogo(file));
    }

    /**
     * Upload player photo
     */
    @PostMapping("/players")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadPlayerPhoto(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "player photo", () -> fileUploadService.uploadPlayerPhoto(file));
    }

    /**
     * Upload country flag
     */
    @PostMapping("/countries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadCountryFlag(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "country flag", () -> fileUploadService.uploadCountryFlag(file));
    }

    /**
     * Upload league logo
     */
    @PostMapping("/leagues")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadLeagueLogo(@RequestParam("file") MultipartFile file) {
        return uploadFile(file, "league logo", () -> fileUploadService.uploadLeagueLogo(file));
    }

    /**
     * Generic file upload handler
     */
    private ResponseEntity<Map<String, Object>> uploadFile(MultipartFile file, String type, FileUploader uploader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(response);
            }

            String fileUrl = uploader.upload();
            
            response.put("success", true);
            response.put("message", type.substring(0, 1).toUpperCase() + type.substring(1) + " uploaded successfully");
            response.put("fileUrl", fileUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            
            logger.info("Successfully uploaded {}: {}", type, fileUrl);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            logger.warn("Invalid file upload attempt for {}: {}", type, e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Failed to upload " + type + ": " + e.getMessage());
            logger.error("Error uploading {}", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Serve uploaded files
     */
    @GetMapping("/{category}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String category, @PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads", category, filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = getContentType(filename);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                logger.warn("File not found or not readable: {}/{}", category, filename);
                return ResponseEntity.notFound().build();
            }
            
        } catch (MalformedURLException e) {
            logger.error("Error serving file: {}/{}", category, filename, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete uploaded file
     */
    @DeleteMapping("/{category}/{filename:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable String category, @PathVariable String filename) {
        Map<String, Object> response = new HashMap<>();
        
        String fileUrl = "/uploads/" + category + "/" + filename;
        boolean deleted = fileUploadService.deleteFile(fileUrl);
        
        if (deleted) {
            response.put("success", true);
            response.put("message", "File deleted successfully");
            logger.info("File deleted: {}", fileUrl);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "File not found or could not be deleted");
            logger.warn("Could not delete file: {}", fileUrl);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get file info
     */
    @GetMapping("/info/{category}/{filename:.+}")
    public ResponseEntity<Map<String, Object>> getFileInfo(@PathVariable String category, @PathVariable String filename) {
        Map<String, Object> response = new HashMap<>();
        
        String fileUrl = "/uploads/" + category + "/" + filename;
        
        if (fileUploadService.fileExists(fileUrl)) {
            response.put("exists", true);
            response.put("url", fileUrl);
            response.put("size", fileUploadService.getFileSize(fileUrl));
            response.put("category", category);
            response.put("filename", filename);
            return ResponseEntity.ok(response);
        } else {
            response.put("exists", false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get content type for file
     */
    private String getContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "bmp":
                return "image/bmp";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }

    /**
     * Functional interface for file upload operations
     */
    @FunctionalInterface
    private interface FileUploader {
        String upload() throws IOException;
    }
}
