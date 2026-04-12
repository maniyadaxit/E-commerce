package com.giva.controller;

import com.giva.dto.response.BlogDetailResponse;
import com.giva.dto.response.BlogSummaryResponse;
import com.giva.service.BlogService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public ResponseEntity<List<BlogSummaryResponse>> blogs() {
        return ResponseEntity.ok(blogService.listPublished());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogDetailResponse> blog(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getBySlug(slug));
    }
}
