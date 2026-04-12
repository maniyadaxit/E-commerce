package com.giva.repository;

import com.giva.model.ProductImage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProduct_IdOrderBySortOrderAsc(UUID productId);
}
