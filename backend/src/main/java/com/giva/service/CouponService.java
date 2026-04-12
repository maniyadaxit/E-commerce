package com.giva.service;

import com.giva.dto.request.CouponRequest;
import com.giva.dto.request.CouponValidationRequest;
import com.giva.dto.response.CouponValidationResponse;
import com.giva.exception.BadRequestException;
import com.giva.model.Coupon;
import com.giva.model.DiscountType;
import com.giva.repository.CouponRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validate(CouponValidationRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.code())
            .orElseThrow(() -> new BadRequestException("Coupon code is invalid"));
        validateCoupon(coupon, request.cartTotal());
        long discount = calculateDiscount(coupon, request.cartTotal());
        long finalTotal = Math.max(request.cartTotal() - discount, 0);
        return new CouponValidationResponse(true, coupon.getCode(), discount, finalTotal, "Coupon applied successfully");
    }

    @Transactional(readOnly = true)
    public Coupon getCouponEntity(String code, long cartTotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
            .orElseThrow(() -> new BadRequestException("Coupon code is invalid"));
        validateCoupon(coupon, cartTotal);
        return coupon;
    }

    public long calculateDiscount(Coupon coupon, long cartTotal) {
        return switch (coupon.getDiscountType()) {
            case FLAT -> Math.min(coupon.getDiscountValue(), cartTotal);
            case PERCENT -> Math.round((cartTotal * coupon.getDiscountValue()) / 100.0);
        };
    }

    @Transactional(readOnly = true)
    public List<Coupon> listCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon create(CouponRequest request) {
        Coupon coupon = Coupon.builder()
            .code(request.code().trim().toUpperCase())
            .discountType(request.discountType())
            .discountValue(request.discountValue())
            .minOrderValue(request.minOrderValue())
            .maxUses(request.maxUses())
            .usedCount(0)
            .validFrom(request.validFrom())
            .validUntil(request.validUntil())
            .active(request.active())
            .build();
        return couponRepository.save(coupon);
    }

    private void validateCoupon(Coupon coupon, long cartTotal) {
        OffsetDateTime now = OffsetDateTime.now();
        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon is inactive");
        }
        if (cartTotal < coupon.getMinOrderValue()) {
            throw new BadRequestException("Coupon minimum order value not met");
        }
        if (coupon.getValidFrom().isAfter(now) || coupon.getValidUntil().isBefore(now)) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
    }
}
