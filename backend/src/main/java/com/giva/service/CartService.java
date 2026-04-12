package com.giva.service;

import com.giva.dto.request.CartItemRequest;
import com.giva.dto.request.CartItemUpdateRequest;
import com.giva.dto.response.CartResponse;
import com.giva.exception.BadRequestException;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Cart;
import com.giva.model.CartItem;
import com.giva.model.Product;
import com.giva.model.ProductVariant;
import com.giva.repository.CartItemRepository;
import com.giva.repository.CartRepository;
import com.giva.repository.ProductRepository;
import com.giva.repository.ProductVariantRepository;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CurrentUserService currentUserService;
    private final ResponseMapper responseMapper;

    public CartService(
        CartRepository cartRepository,
        CartItemRepository cartItemRepository,
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository,
        CurrentUserService currentUserService,
        ResponseMapper responseMapper
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.currentUserService = currentUserService;
        this.responseMapper = responseMapper;
    }

    @Transactional
    public CartResponse getCart() {
        return responseMapper.toCartResponse(resolveCart());
    }

    @Transactional
    public CartResponse addItem(CartItemRequest request) {
        Cart cart = resolveCart();
        Product product = productRepository.findByIdAndActiveTrue(request.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        ProductVariant variant = request.variantId() == null
            ? null
            : productVariantRepository.findByIdAndProduct_Id(request.variantId(), product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        if (request.customizationText() != null && !request.customizationText().isBlank() && !product.isAllowCustomization()) {
            throw new BadRequestException("Selected product does not support customization");
        }

        CartItem existing = cart.getItems().stream()
            .filter(item -> Objects.equals(item.getProduct().getId(), product.getId()))
            .filter(item -> Objects.equals(item.getVariant() == null ? null : item.getVariant().getId(), request.variantId()))
            .filter(item -> Objects.equals(item.getCustomizationText(), request.customizationText()))
            .findFirst()
            .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.quantity());
        } else {
            cart.getItems().add(CartItem.builder()
                .cart(cart)
                .product(product)
                .variant(variant)
                .quantity(request.quantity())
                .customizationText(request.customizationText())
                .build());
        }
        return responseMapper.toCartResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(java.util.UUID itemId, CartItemUpdateRequest request) {
        Cart cart = resolveCart();
        CartItem item = cartItemRepository.findByIdAndCart_Id(itemId, cart.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        item.setQuantity(request.quantity());
        return responseMapper.toCartResponse(cart);
    }

    @Transactional
    public void removeItem(java.util.UUID itemId) {
        Cart cart = resolveCart();
        CartItem item = cartItemRepository.findByIdAndCart_Id(itemId, cart.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clear() {
        Cart cart = resolveCart();
        cart.getItems().clear();
    }

    @Transactional
    public Cart resolveCart() {
        return cartRepository.findByUser_Id(currentUserService.userId())
            .orElseGet(() -> cartRepository.save(Cart.builder().user(currentUserService.user()).build()));
    }
}
