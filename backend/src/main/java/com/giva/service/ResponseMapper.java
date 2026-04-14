package com.giva.service;

import com.giva.dto.response.AddressResponse;
import com.giva.dto.response.AdminUserResponse;
import com.giva.dto.response.BlogDetailResponse;
import com.giva.dto.response.BlogSummaryResponse;
import com.giva.dto.response.CartItemResponse;
import com.giva.dto.response.CartResponse;
import com.giva.dto.response.CollectionResponse;
import com.giva.dto.response.CouponResponse;
import com.giva.dto.response.OrderDetailResponse;
import com.giva.dto.response.OrderItemResponse;
import com.giva.dto.response.OrderSummaryResponse;
import com.giva.dto.response.ProductCardResponse;
import com.giva.dto.response.ProductDetailResponse;
import com.giva.dto.response.ProductImageResponse;
import com.giva.dto.response.ProductMiniResponse;
import com.giva.dto.response.ProductVariantResponse;
import com.giva.dto.response.ReviewResponse;
import com.giva.dto.response.UserResponse;
import com.giva.model.Address;
import com.giva.model.Blog;
import com.giva.model.Cart;
import com.giva.model.CartItem;
import com.giva.model.Collection;
import com.giva.model.Coupon;
import com.giva.model.Order;
import com.giva.model.OrderItem;
import com.giva.model.Product;
import com.giva.model.ProductAttribute;
import com.giva.model.ProductImage;
import com.giva.model.ProductVariant;
import com.giva.model.Review;
import com.giva.model.User;
import com.giva.util.PriceUtil;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ResponseMapper {

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.isEnabled(),
            user.getBirthday()
        );
    }

    public AdminUserResponse toAdminUserResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.isEnabled(),
            user.getCreatedAt()
        );
    }

    public AddressResponse toAddressResponse(Address address) {
        return new AddressResponse(
            address.getId(),
            address.getName(),
            address.getPhone(),
            address.getLine1(),
            address.getLine2(),
            address.getCity(),
            address.getState(),
            address.getPincode(),
            address.isDefaultAddress()
        );
    }

    public ProductMiniResponse toProductMiniResponse(Product product) {
        return new ProductMiniResponse(
            product.getId(),
            product.getName(),
            product.getSlug(),
            product.getMetal(),
            resolveProductPrice(product),
            product.getMrp(),
            primaryImageUrl(product)
        );
    }

    public ProductVariantResponse toProductVariantResponse(Product product, ProductVariant variant) {
        long price = variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getBasePrice();
        return new ProductVariantResponse(
            variant.getId(),
            variant.getColour(),
            variant.getSize(),
            variant.getSku(),
            price,
            variant.getStockQty()
        );
    }

    public ProductImageResponse toProductImageResponse(ProductImage image) {
        return new ProductImageResponse(
            image.getId(),
            image.getColour(),
            image.getUrl(),
            image.getAltText(),
            image.getSortOrder(),
            image.isPrimary()
        );
    }

    public ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getRating(),
            review.getTitle(),
            review.getBody(),
            review.getImageUrl(),
            review.isApproved(),
            review.getProduct().getName(),
            review.getUser().getName(),
            review.getCreatedAt()
        );
    }

    public ProductCardResponse toProductCardResponse(Product product, double rating, long reviewCount) {
        List<ProductImage> images = sortedImages(product);
        return new ProductCardResponse(
            product.getId(),
            product.getName(),
            product.getSlug(),
            product.getMetal(),
            resolveProductPrice(product),
            product.getMrp(),
            product.isBestseller(),
            product.isActive(),
            product.getMrp() > resolveProductPrice(product),
            images.isEmpty() ? null : images.get(0).getUrl(),
            images.size() > 1 ? images.get(1).getUrl() : (images.isEmpty() ? null : images.get(0).getUrl()),
            product.getVariants().stream().map(variant -> variant.getColour().name()).distinct().toList(),
            rating,
            reviewCount,
            product.getCreatedAt()
        );
    }

    public ProductDetailResponse toProductDetailResponse(Product product, double rating, long reviewCount, List<Review> reviews) {
        Map<String, List<String>> attributes = product.getAttributes().stream()
            .collect(Collectors.groupingBy(ProductAttribute::getKey, Collectors.mapping(ProductAttribute::getValue, Collectors.toList())));
        return new ProductDetailResponse(
            product.getId(),
            product.getName(),
            product.getSlug(),
            product.getDescription(),
            product.getMetal(),
            resolveProductPrice(product),
            product.getMrp(),
            product.isBestseller(),
            product.isActive(),
            product.isAllowCustomization(),
            product.getStockQty(),
            product.getWeightGrams(),
            PriceUtil.discountPercent(resolveProductPrice(product), product.getMrp()),
            rating,
            reviewCount,
            product.getCollectionProducts().stream()
                .map(cp -> cp.getCollection().getName())
                .distinct()
                .toList(),
            product.getVariants().stream()
                .sorted(Comparator.comparing(ProductVariant::getColour).thenComparing(variant -> Objects.toString(variant.getSize(), "")))
                .map(variant -> toProductVariantResponse(product, variant))
                .toList(),
            sortedImages(product).stream().map(this::toProductImageResponse).toList(),
            attributes,
            reviews.stream().map(this::toReviewResponse).toList()
        );
    }

    public CollectionResponse toCollectionResponse(Collection collection, long productCount) {
        return new CollectionResponse(
            collection.getId(),
            collection.getName(),
            collection.getHandle(),
            collection.getDescription(),
            collection.getBannerImageUrl(),
            collection.isActive(),
            collection.getSortOrder(),
            productCount
        );
    }

    public CouponResponse toCouponResponse(Coupon coupon) {
        return new CouponResponse(
            coupon.getId(),
            coupon.getCode(),
            coupon.getDiscountType(),
            coupon.getDiscountValue(),
            coupon.getMinOrderValue(),
            coupon.getMaxUses(),
            coupon.getUsedCount(),
            coupon.getValidFrom(),
            coupon.getValidUntil(),
            coupon.isActive()
        );
    }

    public CartItemResponse toCartItemResponse(CartItem item) {
        long unitPrice = item.getVariant() != null && item.getVariant().getPriceOverride() != null
            ? item.getVariant().getPriceOverride()
            : item.getProduct().getBasePrice();
        return new CartItemResponse(
            item.getId(),
            toProductMiniResponse(item.getProduct()),
            item.getVariant() == null ? null : toProductVariantResponse(item.getProduct(), item.getVariant()),
            item.getQuantity(),
            item.getCustomizationText(),
            unitPrice * item.getQuantity()
        );
    }

    public CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(this::toCartItemResponse).toList();
        long subtotal = items.stream().mapToLong(CartItemResponse::lineTotal).sum();
        long totalItems = items.stream().mapToLong(CartItemResponse::quantity).sum();
        return new CartResponse(cart.getId(), items, subtotal, totalItems);
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getProductName(),
            item.getProduct().getSlug(),
            primaryImageUrl(item.getProduct()),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getCustomizationText()
        );
    }

    public OrderSummaryResponse toOrderSummaryResponse(Order order) {
        return new OrderSummaryResponse(
            order.getId(),
            order.getStatus(),
            order.getSubtotal(),
            order.getDiscount(),
            order.getShippingFee(),
            order.getTotal(),
            order.getPaymentMethod(),
            order.getCreatedAt()
        );
    }

    public OrderDetailResponse toOrderDetailResponse(Order order) {
        return new OrderDetailResponse(
            order.getId(),
            order.getStatus(),
            toAddressResponse(order.getAddress()),
            order.getSubtotal(),
            order.getDiscount(),
            order.getShippingFee(),
            order.getTotal(),
            order.getCouponCode(),
            order.getPaymentMethod(),
            order.getPaymentId(),
            order.getRazorpayOrderId(),
            order.getCreatedAt(),
            order.getUpdatedAt(),
            order.getItems().stream().map(this::toOrderItemResponse).toList()
        );
    }

    public BlogSummaryResponse toBlogSummaryResponse(Blog blog) {
        String content = blog.getContent().replaceAll("<[^>]*>", "");
        String excerpt = content.length() > 120 ? content.substring(0, 120) + "..." : content;
        return new BlogSummaryResponse(
            blog.getId(),
            blog.getTitle(),
            blog.getSlug(),
            excerpt,
            blog.getAuthor(),
            blog.getCoverImageUrl(),
            blog.getPublishedAt()
        );
    }

    public BlogDetailResponse toBlogDetailResponse(Blog blog) {
        return new BlogDetailResponse(
            blog.getId(),
            blog.getTitle(),
            blog.getSlug(),
            blog.getContent(),
            blog.getAuthor(),
            blog.getCoverImageUrl(),
            blog.getPublishedAt()
        );
    }

    public long resolveProductPrice(Product product) {
        return product.getVariants().stream()
            .map(ProductVariant::getPriceOverride)
            .filter(Objects::nonNull)
            .min(Long::compareTo)
            .orElse(product.getBasePrice());
    }

    public ProductImage primaryImage(Product product) {
        return sortedImages(product).stream()
            .filter(ProductImage::isPrimary)
            .findFirst()
            .orElseGet(() -> sortedImages(product).stream().findFirst().orElse(null));
    }

    public String primaryImageUrl(Product product) {
        ProductImage image = primaryImage(product);
        return image == null ? null : image.getUrl();
    }

    private List<ProductImage> sortedImages(Product product) {
        return product.getImages().stream()
            .sorted(Comparator.comparingInt(ProductImage::getSortOrder))
            .toList();
    }
}
