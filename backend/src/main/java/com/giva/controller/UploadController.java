package com.giva.controller;

import com.giva.dto.response.UploadResponse;
import com.giva.service.LocalFileStorageService;
import com.giva.service.LocalFileStorageService.StoredFile;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/owner/uploads", "/api/v1/admin/uploads"})
public class UploadController {

    private final LocalFileStorageService localFileStorageService;

    public UploadController(LocalFileStorageService localFileStorageService) {
        this.localFileStorageService = localFileStorageService;
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        StoredFile storedFile = localFileStorageService.storeProductImage(file);
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path(storedFile.relativePath())
            .toUriString();
        return ResponseEntity.ok(new UploadResponse(url, storedFile.relativePath(), storedFile.filename()));
    }
}
