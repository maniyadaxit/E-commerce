package com.giva.service;

import com.giva.dto.request.CollectionRequest;
import com.giva.dto.response.CollectionResponse;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Collection;
import com.giva.repository.CollectionProductRepository;
import com.giva.repository.CollectionRepository;
import com.giva.repository.ProductRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionProductRepository collectionProductRepository;
    private final ProductRepository productRepository;
    private final ResponseMapper responseMapper;

    public CollectionService(
        CollectionRepository collectionRepository,
        CollectionProductRepository collectionProductRepository,
        ProductRepository productRepository,
        ResponseMapper responseMapper
    ) {
        this.collectionRepository = collectionRepository;
        this.collectionProductRepository = collectionProductRepository;
        this.productRepository = productRepository;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public List<CollectionResponse> getAll() {
        return collectionRepository.findByActiveTrueOrderBySortOrderAsc().stream()
            .map(collection -> responseMapper.toCollectionResponse(collection, collection.getCollectionProducts().size()))
            .toList();
    }

    @Transactional(readOnly = true)
    public Collection getByHandle(String handle) {
        return collectionRepository.findByHandle(handle)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
    }

    @Transactional
    public CollectionResponse create(CollectionRequest request) {
        Collection collection = Collection.builder()
            .name(request.name().trim())
            .handle(request.handle().trim().toLowerCase(Locale.ENGLISH))
            .description(request.description())
            .bannerImageUrl(resolveBannerImageUrl(request))
            .active(request.active())
            .sortOrder(request.sortOrder())
            .build();
        Collection saved = collectionRepository.save(collection);
        return responseMapper.toCollectionResponse(saved, 0);
    }

    @Transactional
    public void delete(java.util.UUID id) {
        Collection collection = collectionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));

        collection.getPrimaryProducts().forEach(product -> product.setPrimaryCollection(null));
        productRepository.saveAll(collection.getPrimaryProducts());

        collectionProductRepository.deleteByCollection_Id(id);
        collectionRepository.delete(collection);
    }

    private String resolveBannerImageUrl(CollectionRequest request) {
        if (request.bannerImageUrl() != null && !request.bannerImageUrl().isBlank()) {
            return request.bannerImageUrl().trim();
        }
        String label = URLEncoder.encode(request.name().trim(), StandardCharsets.UTF_8);
        return "https://placehold.co/1600x720/png?text=" + label;
    }
}
