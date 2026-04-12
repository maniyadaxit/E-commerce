package com.giva.repository;

import com.giva.model.ProductVariant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProduct_Id(UUID productId);

    Optional<ProductVariant> findByIdAndProduct_Id(UUID id, UUID productId);
}
