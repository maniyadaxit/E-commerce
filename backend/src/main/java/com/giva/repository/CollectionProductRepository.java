package com.giva.repository;

import com.giva.model.CollectionProduct;
import com.giva.model.CollectionProductId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollectionProductRepository extends JpaRepository<CollectionProduct, CollectionProductId> {

    List<CollectionProduct> findByCollection_IdOrderBySortOrderAsc(UUID collectionId);

    void deleteByCollection_Id(UUID collectionId);
}
