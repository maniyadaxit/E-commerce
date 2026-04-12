package com.giva.service;

import com.giva.dto.request.AddressRequest;
import com.giva.dto.request.UserUpdateRequest;
import com.giva.dto.response.AddressResponse;
import com.giva.dto.response.UserResponse;
import com.giva.exception.BadRequestException;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Address;
import com.giva.model.User;
import com.giva.repository.AddressRepository;
import com.giva.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CurrentUserService currentUserService;
    private final ResponseMapper responseMapper;

    public UserService(
        UserRepository userRepository,
        AddressRepository addressRepository,
        CurrentUserService currentUserService,
        ResponseMapper responseMapper
    ) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.currentUserService = currentUserService;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public UserResponse me() {
        return responseMapper.toUserResponse(currentUserService.user());
    }

    @Transactional
    public UserResponse update(UserUpdateRequest request) {
        User user = currentUserService.user();
        userRepository.findByEmailIgnoreCase(request.email())
            .filter(existing -> !existing.getId().equals(user.getId()))
            .ifPresent(existing -> {
                throw new BadRequestException("Email is already in use");
            });
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPhone(request.phone());
        user.setBirthday(request.birthday());
        return responseMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> addresses() {
        return addressRepository.findByUser_IdOrderByDefaultAddressDescCreatedAtDesc(currentUserService.userId()).stream()
            .map(responseMapper::toAddressResponse)
            .toList();
    }

    @Transactional
    public AddressResponse createAddress(AddressRequest request) {
        User user = currentUserService.user();
        if (request.defaultAddress()) {
            clearDefault(user.getId());
        }
        Address address = Address.builder()
            .user(user)
            .name(request.name())
            .phone(request.phone())
            .line1(request.line1())
            .line2(request.line2())
            .city(request.city())
            .state(request.state())
            .pincode(request.pincode())
            .defaultAddress(request.defaultAddress())
            .build();
        return responseMapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(UUID id, AddressRequest request) {
        Address address = addressRepository.findByIdAndUser_Id(id, currentUserService.userId())
            .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (request.defaultAddress()) {
            clearDefault(currentUserService.userId());
        }
        address.setName(request.name());
        address.setPhone(request.phone());
        address.setLine1(request.line1());
        address.setLine2(request.line2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPincode(request.pincode());
        address.setDefaultAddress(request.defaultAddress());
        return responseMapper.toAddressResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID id) {
        Address address = addressRepository.findByIdAndUser_Id(id, currentUserService.userId())
            .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    private void clearDefault(UUID userId) {
        addressRepository.findByUser_IdOrderByDefaultAddressDescCreatedAtDesc(userId).forEach(address -> address.setDefaultAddress(false));
    }
}
