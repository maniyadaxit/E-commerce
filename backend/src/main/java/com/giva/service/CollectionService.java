package com.giva.service;

import com.giva.dto.request.CollectionRequest;
import com.giva.dto.response.CollectionResponse;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Collection;
import com.giva.repository.CollectionRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final ResponseMapper responseMapper;

    public CollectionService(CollectionRepository collectionRepository, ResponseMapper responseMapper) {
        this.collectionRepository = collectionRepository;
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
            .bannerImageUrl(request.bannerImageUrl())
            .active(request.active())
            .sortOrder(request.sortOrder())
            .build();
        Collection saved = collectionRepository.save(collection);
        return responseMapper.toCollectionResponse(saved, 0);
    }
}
