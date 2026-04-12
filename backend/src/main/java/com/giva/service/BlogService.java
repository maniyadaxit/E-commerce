package com.giva.service;

import com.giva.dto.response.BlogDetailResponse;
import com.giva.dto.response.BlogSummaryResponse;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Blog;
import com.giva.repository.BlogRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlogService {

    private final BlogRepository blogRepository;
    private final ResponseMapper responseMapper;

    public BlogService(BlogRepository blogRepository, ResponseMapper responseMapper) {
        this.blogRepository = blogRepository;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public List<BlogSummaryResponse> listPublished() {
        return blogRepository.findByPublishedTrueOrderByPublishedAtDesc().stream()
            .map(responseMapper::toBlogSummaryResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BlogDetailResponse getBySlug(String slug) {
        Blog blog = blogRepository.findBySlugAndPublishedTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        return responseMapper.toBlogDetailResponse(blog);
    }
}
