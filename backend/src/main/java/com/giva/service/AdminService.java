package com.giva.service;

import com.giva.dto.response.AdminUserResponse;
import com.giva.dto.response.DashboardStatsResponse;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.OrderStatus;
import com.giva.model.User;
import com.giva.repository.OrderRepository;
import com.giva.repository.ProductRepository;
import com.giva.repository.UserRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ResponseMapper responseMapper;

    public AdminService(
        OrderRepository orderRepository,
        ProductRepository productRepository,
        UserRepository userRepository,
        ResponseMapper responseMapper
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse dashboard() {
        OffsetDateTime startOfDay = OffsetDateTime.now().toLocalDate().atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfDay = startOfDay.plusDays(1);

        long totalRevenue = orderRepository.findAll().stream()
            .filter(order -> order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED)
            .mapToLong(order -> order.getTotal() == null ? 0L : order.getTotal())
            .sum();
        long ordersToday = orderRepository.findAll().stream()
            .filter(order -> !order.getCreatedAt().isBefore(startOfDay) && order.getCreatedAt().isBefore(endOfDay))
            .count();
        long activeUsers = userRepository.findAll().stream().filter(User::isEnabled).count();
        long lowStockProducts = productRepository.findAll().stream()
            .filter(product -> product.isActive() && product.getStockQty() <= 5)
            .count();
        return new DashboardStatsResponse(totalRevenue, ordersToday, activeUsers, lowStockProducts);
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> users() {
        return userRepository.findAll().stream()
            .map(responseMapper::toAdminUserResponse)
            .toList();
    }

    @Transactional
    public AdminUserResponse setUserEnabled(UUID id, boolean enabled) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(enabled);
        return responseMapper.toAdminUserResponse(user);
    }
}
