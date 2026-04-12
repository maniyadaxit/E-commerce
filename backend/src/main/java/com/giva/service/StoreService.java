package com.giva.service;

import com.giva.dto.response.StoreLocationResponse;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class StoreService {

    private final List<StoreLocationResponse> stores = List.of(
        new StoreLocationResponse("Mumbai", "Aurora Gems Bandra Flagship", "Linking Road, Bandra West, Mumbai", "400050", "+91 22 0000 1001", "https://maps.google.com/?q=19.0596,72.8295&output=embed", 19.0596, 72.8295),
        new StoreLocationResponse("Bengaluru", "Aurora Gems Indiranagar Studio", "100 Feet Road, Indiranagar, Bengaluru", "560038", "+91 80 0000 1002", "https://maps.google.com/?q=12.9719,77.6412&output=embed", 12.9719, 77.6412),
        new StoreLocationResponse("Delhi", "Aurora Gems Select Citywalk", "Saket District Centre, New Delhi", "110017", "+91 11 0000 1003", "https://maps.google.com/?q=28.5283,77.2197&output=embed", 28.5283, 77.2197),
        new StoreLocationResponse("Hyderabad", "Aurora Gems Jubilee Hills", "Road No. 36, Jubilee Hills, Hyderabad", "500033", "+91 40 0000 1004", "https://maps.google.com/?q=17.4326,78.4071&output=embed", 17.4326, 78.4071)
    );

    public List<StoreLocationResponse> search(String query) {
        if (query == null || query.isBlank()) {
            return stores;
        }
        String search = query.toLowerCase(Locale.ENGLISH);
        return stores.stream()
            .filter(store ->
                store.city().toLowerCase(Locale.ENGLISH).contains(search) ||
                store.pincode().contains(search) ||
                store.name().toLowerCase(Locale.ENGLISH).contains(search)
            )
            .toList();
    }
}
