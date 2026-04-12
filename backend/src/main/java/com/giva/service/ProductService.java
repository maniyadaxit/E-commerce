package com.giva.service;

import com.giva.dto.request.AdminProductInventoryRequest;
import com.giva.dto.request.AdminProductVariantInventoryRequest;
import com.giva.dto.request.ProductImageRequest;
import com.giva.dto.request.ProductRequest;
import com.giva.dto.request.ProductVariantRequest;
import com.giva.dto.response.AdminProductInventoryResponse;
import com.giva.dto.response.AdminProductVariantInventoryResponse;
import com.giva.dto.response.PageResponse;
import com.giva.dto.response.ProductCardResponse;
import com.giva.dto.response.ProductDetailResponse;
import com.giva.exception.BadRequestException;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Collection;
import com.giva.model.CollectionProduct;
import com.giva.model.CollectionProductId;
import com.giva.model.Product;
import com.giva.model.ProductColour;
import com.giva.model.ProductImage;
import com.giva.model.ProductMetal;
import com.giva.model.ProductAttribute;
import com.giva.model.ProductVariant;
import com.giva.repository.CollectionRepository;
import com.giva.repository.ProductRepository;
import com.giva.repository.ReviewRepository;
import com.giva.util.ProductSpecifications;
import com.giva.util.SlugUtil;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CollectionRepository collectionRepository;
    private final ReviewRepository reviewRepository;
    private final ResponseMapper responseMapper;

    public ProductService(
        ProductRepository productRepository,
        CollectionRepository collectionRepository,
        ReviewRepository reviewRepository,
        ResponseMapper responseMapper
    ) {
        this.productRepository = productRepository;
        this.collectionRepository = collectionRepository;
        this.reviewRepository = reviewRepository;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductCardResponse> getProducts(
        int page,
        int size,
        String q,
        String metal,
        String colour,
        String style,
        String occasion,
        String recipient,
        String theme,
        Long minPrice,
        Long maxPrice,
        String sort,
        String collectionHandle
    ) {
        Specification<Product> specification = ProductSpecifications.filter(
            q,
            parseMetal(metal),
            parseColour(colour),
            style,
            occasion,
            recipient,
            theme,
            minPrice,
            maxPrice,
            collectionHandle
        );

        Page<Product> productPage = productRepository.findAll(
            specification,
            PageRequest.of(page, size, resolveSort(sort))
        );

        List<ProductCardResponse> items = productPage.getContent().stream()
            .map(this::toProductCardResponse)
            .toList();

        return new PageResponse<>(
            items,
            productPage.getNumber(),
            productPage.getSize(),
            productPage.getTotalElements(),
            productPage.getTotalPages(),
            productPage.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toProductDetailResponse(product);
    }

    @Transactional
    public ProductDetailResponse create(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        Product saved = productRepository.save(product);
        return toProductDetailResponse(saved);
    }

    @Transactional
    public ProductDetailResponse update(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        applyRequest(product, request);
        Product saved = productRepository.save(product);
        return toProductDetailResponse(saved);
    }

    @Transactional(readOnly = true)
    public AdminProductInventoryResponse getAdminInventory(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toAdminProductInventoryResponse(product);
    }

    @Transactional
    public AdminProductInventoryResponse updateAdminInventory(UUID id, AdminProductInventoryRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setBasePrice(request.basePrice());
        product.setMrp(request.mrp());
        product.setStockQty(request.stockQty());
        product.setActive(request.active());

        if (request.variants() != null && !request.variants().isEmpty()) {
            Map<UUID, AdminProductVariantInventoryRequest> variantsById = request.variants().stream()
                .collect(Collectors.toMap(AdminProductVariantInventoryRequest::id, Function.identity()));

            if (variantsById.size() != product.getVariants().size()) {
                throw new BadRequestException("Variant payload does not match product variants");
            }

            product.getVariants().forEach(variant -> {
                AdminProductVariantInventoryRequest variantRequest = variantsById.get(variant.getId());
                if (variantRequest == null) {
                    throw new BadRequestException("Missing variant in inventory payload");
                }
                variant.setStockQty(variantRequest.stockQty());
                variant.setPriceOverride(
                    variantRequest.price().equals(request.basePrice()) ? null : variantRequest.price()
                );
            });
        }

        Product saved = productRepository.save(product);
        return toAdminProductInventoryResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    private ProductCardResponse toProductCardResponse(Product product) {
        return responseMapper.toProductCardResponse(
            product,
            reviewRepository.averageRating(product.getId()),
            reviewRepository.countByProduct_IdAndApprovedTrue(product.getId())
        );
    }

    private ProductDetailResponse toProductDetailResponse(Product product) {
        double rating = reviewRepository.averageRating(product.getId());
        long reviewCount = reviewRepository.countByProduct_IdAndApprovedTrue(product.getId());
        return responseMapper.toProductDetailResponse(
            product,
            rating,
            reviewCount,
            reviewRepository.findByProduct_IdAndApprovedTrueOrderByCreatedAtDesc(product.getId())
        );
    }

    private AdminProductInventoryResponse toAdminProductInventoryResponse(Product product) {
        List<AdminProductVariantInventoryResponse> variants = product.getVariants().stream()
            .sorted(Comparator.comparing(ProductVariant::getColour).thenComparing(variant -> String.valueOf(variant.getSize())))
            .map(variant -> new AdminProductVariantInventoryResponse(
                variant.getId(),
                variant.getColour(),
                variant.getSize(),
                variant.getSku(),
                variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getBasePrice(),
                variant.getStockQty()
            ))
            .toList();

        return new AdminProductInventoryResponse(
            product.getId(),
            product.getName(),
            product.getSlug(),
            product.getMetal(),
            product.getBasePrice(),
            product.getMrp(),
            product.getStockQty(),
            product.isActive(),
            product.getWeightGrams(),
            product.getPrimaryCollection() == null ? null : product.getPrimaryCollection().getName(),
            variants
        );
    }

    private void applyRequest(Product product, ProductRequest request) {
        if (product.getId() == null) {
            product.setId(UUID.randomUUID());
        }
        product.setName(request.name().trim());
        product.setSlug(SlugUtil.slugify(request.name()));
        product.setDescription(request.description().trim());
        product.setMetal(request.metal());
        product.setBasePrice(request.basePrice());
        product.setMrp(request.mrp());
        product.setBestseller(request.bestseller());
        product.setActive(request.active());
        product.setAllowCustomization(request.allowCustomization());
        product.setStockQty(request.stockQty());
        product.setWeightGrams(request.weightGrams());

        Collection primaryCollection = request.primaryCollectionId() == null
            ? null
            : collectionRepository.findById(request.primaryCollectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary collection not found"));
        product.setPrimaryCollection(primaryCollection);

        product.getVariants().clear();
        request.variants().forEach(variantRequest -> product.getVariants().add(buildVariant(product, variantRequest)));

        product.getImages().clear();
        request.images().stream()
            .sorted(Comparator.comparing(ProductImageRequest::sortOrder))
            .forEach(imageRequest -> product.getImages().add(buildImage(product, imageRequest)));

        product.getAttributes().clear();
        if (request.attributes() != null) {
            request.attributes().forEach((key, values) -> values.forEach(value ->
                product.getAttributes().add(buildAttribute(product, key, value))
            ));
        }

        product.getCollectionProducts().clear();
        List<UUID> collectionIds = new ArrayList<>();
        if (primaryCollection != null) {
            collectionIds.add(primaryCollection.getId());
        }
        if (request.collectionIds() != null) {
            request.collectionIds().stream()
                .filter(id -> !collectionIds.contains(id))
                .forEach(collectionIds::add);
        }
        collectionIds.forEach(collectionId -> {
            Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
            product.getCollectionProducts().add(CollectionProduct.builder()
                .id(new CollectionProductId(collection.getId(), product.getId()))
                .collection(collection)
                .product(product)
                .sortOrder(product.getCollectionProducts().size() + 1)
                .build());
        });
    }

    private ProductVariant buildVariant(Product product, ProductVariantRequest request) {
        return ProductVariant.builder()
            .product(product)
            .colour(request.colour())
            .size(request.size())
            .sku(request.sku())
            .priceOverride(request.priceOverride())
            .stockQty(request.stockQty())
            .build();
    }

    private ProductImage buildImage(Product product, ProductImageRequest request) {
        return ProductImage.builder()
            .product(product)
            .colour(request.colour())
            .url(request.url())
            .altText(request.altText())
            .sortOrder(request.sortOrder())
            .primary(request.primary())
            .build();
    }

    private ProductAttribute buildAttribute(Product product, String key, String value) {
        return ProductAttribute.builder()
            .product(product)
            .key(key)
            .value(value)
            .build();
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Order.desc("bestseller"), Sort.Order.desc("createdAt"));
        }
        return switch (sort.toLowerCase(Locale.ENGLISH)) {
            case "price-low-high", "price-asc" -> Sort.by("basePrice").ascending();
            case "price-high-low", "price-desc" -> Sort.by("basePrice").descending();
            case "newest" -> Sort.by("createdAt").descending();
            case "bestseller" -> Sort.by(Sort.Order.desc("bestseller"), Sort.Order.desc("createdAt"));
            default -> Sort.by(Sort.Order.desc("bestseller"), Sort.Order.desc("createdAt"));
        };
    }

    private ProductMetal parseMetal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return ProductMetal.valueOf(value.trim().toUpperCase(Locale.ENGLISH).replace(' ', '_'));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid metal filter");
        }
    }

    private ProductColour parseColour(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return ProductColour.valueOf(value.trim().toUpperCase(Locale.ENGLISH).replace(' ', '_'));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid colour filter");
        }
    }
}
