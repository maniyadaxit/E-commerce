package com.giva.repository;

import com.giva.model.Blog;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogRepository extends JpaRepository<Blog, UUID> {

    List<Blog> findByPublishedTrueOrderByPublishedAtDesc();

    Optional<Blog> findBySlugAndPublishedTrue(String slug);
}
