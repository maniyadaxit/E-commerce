package com.giva.service;

import com.giva.dto.request.OrderCreateRequest;
import com.giva.dto.request.OrderStatusUpdateRequest;
import com.giva.dto.response.OrderDetailResponse;
import com.giva.dto.response.OrderSummaryResponse;
import com.giva.dto.response.PageResponse;
import com.giva.exception.BadRequestException;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Address;
import com.giva.model.Cart;
import com.giva.model.CartItem;
import com.giva.model.Coupon;
import com.giva.model.Order;
import com.giva.model.OrderItem;
import com.giva.model.OrderStatus;
import com.giva.model.ProductVariant;
import com.giva.repository.AddressRepository;
import com.giva.repository.OrderRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final CurrentUserService currentUserService;
    private final ResponseMapper responseMapper;

    public OrderService(
        OrderRepository orderRepository,
        AddressRepository addressRepository,
        CartService cartService,
        CouponService couponService,
        CurrentUserService currentUserService,
        ResponseMapper responseMapper
    ) {
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.cartService = cartService;
        this.couponService = couponService;
        this.currentUserService = currentUserService;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> mine() {
        return orderRepository.findByUser_IdOrderByCreatedAtDesc(currentUserService.userId()).stream()
            .map(responseMapper::toOrderSummaryResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse mineById(UUID id) {
        Order order = orderRepository.findByIdAndUser_Id(id, currentUserService.userId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return responseMapper.toOrderDetailResponse(order);
    }

    @Transactional
    public OrderDetailResponse place(OrderCreateRequest request) {
        Cart cart = cartService.resolveCart();
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Address address = addressRepository.findByIdAndUser_Id(request.addressId(), currentUserService.userId())
            .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        long subtotal = cart.getItems().stream().mapToLong(this::lineTotal).sum();
        long shippingFee = 0L;
        Coupon coupon = null;
        long discount = 0L;
        if (request.couponCode() != null && !request.couponCode().isBlank()) {
            coupon = couponService.getCouponEntity(request.couponCode(), subtotal);
            discount = couponService.calculateDiscount(coupon, subtotal);
            coupon.setUsedCount(coupon.getUsedCount() + 1);
        }

        long total = Math.max(subtotal - discount + shippingFee, 0L);
        Order order = Order.builder()
            .user(currentUserService.user())
            .address(address)
            .status(OrderStatus.PLACED)
            .subtotal(subtotal)
            .discount(discount)
            .shippingFee(shippingFee)
            .total(total)
            .couponCode(coupon == null ? null : coupon.getCode())
            .paymentMethod(request.paymentMethod())
            .paymentId(request.paymentId())
            .razorpayOrderId(request.razorpayOrderId())
            .build();

        cart.getItems().forEach(item -> {
            ensureStock(item);
            decrementStock(item);
            order.getItems().add(OrderItem.builder()
                .order(order)
                .product(item.getProduct())
                .variant(item.getVariant())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(unitPrice(item))
                .customizationText(item.getCustomizationText())
                .build());
        });

        Order saved = orderRepository.save(order);
        cart.getItems().clear();
        return responseMapper.toOrderDetailResponse(saved);
    }

    @Transactional
    public OrderDetailResponse updateStatus(UUID id, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        validateTransition(order.getStatus(), request.status());
        order.setStatus(request.status());
        return responseMapper.toOrderDetailResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> adminOrders(
        int page,
        int size,
        String status,
        LocalDate dateFrom,
        LocalDate dateTo
    ) {
        List<OrderSummaryResponse> filtered = orderRepository.findAll().stream()
            .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
            .filter(order -> matchesStatus(order, status))
            .filter(order -> matchesDate(order, dateFrom, dateTo))
            .map(responseMapper::toOrderSummaryResponse)
            .toList();

        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<OrderSummaryResponse> items = filtered.subList(fromIndex, toIndex);
        int totalPages = size == 0 ? 1 : (int) Math.ceil(filtered.size() / (double) size);
        return new PageResponse<>(items, page, size, filtered.size(), totalPages, toIndex < filtered.size());
    }

    private boolean matchesStatus(Order order, String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        return order.getStatus().name().equalsIgnoreCase(status);
    }

    private boolean matchesDate(Order order, LocalDate dateFrom, LocalDate dateTo) {
        LocalDate date = order.getCreatedAt().toLocalDate();
        boolean afterStart = dateFrom == null || !date.isBefore(dateFrom);
        boolean beforeEnd = dateTo == null || !date.isAfter(dateTo);
        return afterStart && beforeEnd;
    }

    private long lineTotal(CartItem item) {
        return unitPrice(item) * item.getQuantity();
    }

    private long unitPrice(CartItem item) {
        ProductVariant variant = item.getVariant();
        return variant != null && variant.getPriceOverride() != null
            ? variant.getPriceOverride()
            : item.getProduct().getBasePrice();
    }

    private void ensureStock(CartItem item) {
        if (item.getProduct().getStockQty() < item.getQuantity()) {
            throw new BadRequestException("Insufficient product stock for " + item.getProduct().getName());
        }
        if (item.getVariant() != null && item.getVariant().getStockQty() < item.getQuantity()) {
            throw new BadRequestException("Insufficient variant stock for " + item.getProduct().getName());
        }
    }

    private void decrementStock(CartItem item) {
        item.getProduct().setStockQty(item.getProduct().getStockQty() - item.getQuantity());
        if (item.getVariant() != null) {
            item.getVariant().setStockQty(item.getVariant().getStockQty() - item.getQuantity());
        }
    }

    private void validateTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return;
        }
        boolean valid = switch (current) {
            case PLACED -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED || next == OrderStatus.RETURNED;
            case DELIVERED -> next == OrderStatus.RETURNED;
            case CANCELLED, RETURNED -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid order status transition from %s to %s"
                .formatted(current.name().toLowerCase(Locale.ENGLISH), next.name().toLowerCase(Locale.ENGLISH)));
        }
    }
}
