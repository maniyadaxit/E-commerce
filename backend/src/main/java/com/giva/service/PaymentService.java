package com.giva.service;

import com.giva.config.RazorpayConfig;
import com.giva.dto.request.PaymentCreateOrderRequest;
import com.giva.dto.request.PaymentVerifyRequest;
import com.giva.dto.response.PaymentOrderResponse;
import com.giva.dto.response.PaymentVerificationResponse;
import com.giva.exception.BadRequestException;
import com.razorpay.RazorpayClient;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final RazorpayConfig razorpayConfig;

    public PaymentService(RazorpayConfig razorpayConfig) {
        this.razorpayConfig = razorpayConfig;
    }

    public PaymentOrderResponse createOrder(PaymentCreateOrderRequest request) {
        if (isMockMode()) {
            return new PaymentOrderResponse(
                "order_mock_" + System.currentTimeMillis(),
                "INR",
                request.amount(),
                razorpayConfig.getKeyId(),
                true
            );
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayConfig.getKeyId(), razorpayConfig.getKeySecret());
            JSONObject payload = new JSONObject();
            payload.put("amount", request.amount());
            payload.put("currency", "INR");
            payload.put("receipt", request.receipt());
            com.razorpay.Order order = client.orders.create(payload);
            return new PaymentOrderResponse(
                order.get("id"),
                order.get("currency"),
                order.get("amount"),
                razorpayConfig.getKeyId(),
                false
            );
        } catch (Exception ex) {
            throw new BadRequestException("Failed to create Razorpay order: " + ex.getMessage());
        }
    }

    public PaymentVerificationResponse verify(PaymentVerifyRequest request) {
        try {
            String payload = request.razorpayOrderId() + "|" + request.razorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayConfig.getKeySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expectedSignature = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            boolean verified = expectedSignature.equals(request.razorpaySignature());
            return new PaymentVerificationResponse(
                verified,
                verified ? "Payment signature verified" : "Payment signature mismatch"
            );
        } catch (GeneralSecurityException ex) {
            throw new BadRequestException("Failed to verify Razorpay signature");
        }
    }

    private boolean isMockMode() {
        return razorpayConfig.getKeyId() == null ||
            razorpayConfig.getKeySecret() == null ||
            razorpayConfig.getKeyId().contains("placeholder") ||
            razorpayConfig.getKeySecret().contains("placeholder");
    }
}
