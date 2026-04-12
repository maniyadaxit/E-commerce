package com.giva.util;

import com.giva.model.CollectionProduct;
import com.giva.model.Product;
import com.giva.model.ProductAttribute;
import com.giva.model.ProductColour;
import com.giva.model.ProductMetal;
import com.giva.model.ProductVariant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> filter(
        String q,
        ProductMetal metal,
        ProductColour colour,
        String style,
        String occasion,
        String recipient,
        String theme,
        Long minPrice,
        Long maxPrice,
        String collectionHandle
    ) {
        return (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("active")));

            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(root.get("slug")), like)
                ));
            }

            if (metal != null) {
                predicates.add(cb.equal(root.get("metal"), metal));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }

            if (colour != null) {
                Join<Product, ProductVariant> variants = root.join("variants", JoinType.LEFT);
                predicates.add(cb.equal(variants.get("colour"), colour));
            }

            if (collectionHandle != null && !collectionHandle.isBlank()) {
                Join<Product, CollectionProduct> collectionProducts = root.join("collectionProducts", JoinType.LEFT);
                predicates.add(cb.equal(collectionProducts.get("collection").get("handle"), collectionHandle));
            }

            if (style != null && !style.isBlank()) {
                predicates.add(attributePredicate("style", style, root, query.subquery(Long.class), cb));
            }
            if (occasion != null && !occasion.isBlank()) {
                predicates.add(attributePredicate("occasion", occasion, root, query.subquery(Long.class), cb));
            }
            if (recipient != null && !recipient.isBlank()) {
                predicates.add(attributePredicate("recipient", recipient, root, query.subquery(Long.class), cb));
            }
            if (theme != null && !theme.isBlank()) {
                predicates.add(attributePredicate("theme", theme, root, query.subquery(Long.class), cb));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate attributePredicate(
        String key,
        String value,
        Root<Product> root,
        Subquery<Long> subquery,
        jakarta.persistence.criteria.CriteriaBuilder cb
    ) {
        Root<ProductAttribute> attributeRoot = subquery.from(ProductAttribute.class);
        subquery.select(cb.literal(1L));
        subquery.where(
            cb.equal(attributeRoot.get("product"), root),
            cb.equal(cb.lower(attributeRoot.get("key")), key.toLowerCase()),
            cb.equal(cb.lower(attributeRoot.get("value")), value.toLowerCase())
        );
        return cb.exists(subquery);
    }
}
