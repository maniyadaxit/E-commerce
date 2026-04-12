package com.giva.service;

import com.giva.dto.response.DeliveryCheckResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class DeliveryService {

    private static final Set<String> SAME_DAY = Set.of("400050", "560001", "110001", "122003");
    private static final Set<String> EXPRESS = Set.of("400001", "560034", "122002", "500081", "700091");
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public DeliveryCheckResponse check(String pincode) {
        if (SAME_DAY.contains(pincode)) {
            LocalDate date = LocalDate.now();
            return new DeliveryCheckResponse(pincode, "Same Day", date.format(FORMATTER), "Delivered by end of day");
        }
        if (EXPRESS.contains(pincode)) {
            LocalDate date = LocalDate.now().plusDays(2);
            return new DeliveryCheckResponse(pincode, "Express", date.format(FORMATTER), "Delivered in 1-2 business days");
        }
        LocalDate date = LocalDate.now().plusDays(5);
        return new DeliveryCheckResponse(pincode, "Standard", date.format(FORMATTER), "Delivered in 3-5 business days");
    }
}
