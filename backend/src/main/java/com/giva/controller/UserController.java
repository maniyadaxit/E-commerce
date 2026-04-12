package com.giva.controller;

import com.giva.dto.request.AddressRequest;
import com.giva.dto.request.UserUpdateRequest;
import com.giva.dto.response.AddressResponse;
import com.giva.dto.response.UserResponse;
import com.giva.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(userService.me());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> update(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.update(request));
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<List<AddressResponse>> addresses() {
        return ResponseEntity.ok(userService.addresses());
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.createAddress(request));
    }

    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable UUID id, @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.updateAddress(id, request));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID id) {
        userService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
