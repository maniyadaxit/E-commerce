package com.giva.repository;

import com.giva.model.Order;
import com.giva.model.OrderStatus;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    Optional<Order> findByIdAndUser_Id(UUID id, UUID userId);

    long countByStatusAndCreatedAtBetween(OrderStatus status, OffsetDateTime start, OffsetDateTime end);

    @Query("""
        select case when count(oi) > 0 then true else false end
        from OrderItem oi
        where oi.order.user.id = :userId
          and oi.product.id = :productId
          and oi.order.status in :statuses
        """)
    boolean hasPurchasedProduct(
        @Param("userId") UUID userId,
        @Param("productId") UUID productId,
        @Param("statuses") Collection<OrderStatus> statuses
    );
}
