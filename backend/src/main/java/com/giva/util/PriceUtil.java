package com.giva.util;

public final class PriceUtil {

    private PriceUtil() {
    }

    public static int discountPercent(Long price, Long mrp) {
        if (price == null || mrp == null || mrp <= 0 || price >= mrp) {
            return 0;
        }
        return (int) Math.round(((mrp - price) * 100.0) / mrp);
    }
}
