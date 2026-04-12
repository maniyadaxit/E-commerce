package com.giva.repository;

import com.giva.model.WishlistId;
import com.giva.model.WishlistItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository extends JpaRepository<WishlistItem, WishlistId> {

    List<WishlistItem> findByUser_Id(UUID userId);

    void deleteByUser_IdAndProduct_Id(UUID userId, UUID productId);
}
