package com.giva.service;

import com.giva.exception.BadRequestException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalFileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final Path rootUploadPath;

    public LocalFileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.rootUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public StoredFile storeProductImage(MultipartFile file) {
        validateImage(file);

        String extension = resolveExtension(file);
        String filename = "product-" + UUID.randomUUID() + extension;
        Path productImageDirectory = rootUploadPath.resolve("products").normalize();
        Path targetFile = productImageDirectory.resolve(filename).normalize();

        if (!targetFile.startsWith(productImageDirectory)) {
            throw new BadRequestException("Invalid file name");
        }

        try {
            Files.createDirectories(productImageDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Image upload failed");
        }

        return new StoredFile(filename, "/uploads/products/" + filename);
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ENGLISH).startsWith("image/")) {
            throw new BadRequestException("Only image uploads are supported");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName != null) {
            int extensionIndex = originalName.lastIndexOf('.');
            if (extensionIndex >= 0) {
                String extension = originalName.substring(extensionIndex).toLowerCase(Locale.ENGLISH);
                if (ALLOWED_EXTENSIONS.contains(extension)) {
                    return extension;
                }
            }
        }

        return switch (String.valueOf(file.getContentType()).toLowerCase(Locale.ENGLISH)) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new BadRequestException("Unsupported image format");
        };
    }

    public record StoredFile(String filename, String relativePath) {
    }
}
