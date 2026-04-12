package com.giva.repository;

import com.giva.model.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProduct_IdAndApprovedTrueOrderByCreatedAtDesc(UUID productId);

    List<Review> findByApprovedFalseOrderByCreatedAtDesc();

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.product.id = :productId and r.approved = true")
    double averageRating(@Param("productId") UUID productId);

    long countByProduct_IdAndApprovedTrue(UUID productId);
}
