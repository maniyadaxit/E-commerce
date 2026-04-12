package com.giva.repository;

import com.giva.model.CartItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCart_Id(UUID cartId);

    Optional<CartItem> findByIdAndCart_Id(UUID id, UUID cartId);
}
