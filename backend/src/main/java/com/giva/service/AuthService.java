package com.giva.service;

import com.giva.config.AppUserPrincipal;
import com.giva.dto.request.LoginRequest;
import com.giva.dto.request.RefreshTokenRequest;
import com.giva.dto.request.RegisterRequest;
import com.giva.dto.response.AuthResponse;
import com.giva.exception.BadRequestException;
import com.giva.exception.UnauthorizedException;
import com.giva.model.Cart;
import com.giva.model.User;
import com.giva.model.UserRole;
import com.giva.repository.CartRepository;
import com.giva.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ResponseMapper responseMapper;

    public AuthService(
        UserRepository userRepository,
        CartRepository cartRepository,
        AuthenticationManager authenticationManager,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        ResponseMapper responseMapper
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.responseMapper = responseMapper;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
            .name(request.name().trim())
            .email(request.email().trim().toLowerCase())
            .phone(request.phone())
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(UserRole.CUSTOMER)
            .enabled(true)
            .build();
        User savedUser = userRepository.save(user);

        cartRepository.save(Cart.builder().user(savedUser).build());
        return buildAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!user.isEnabled()) {
            throw new UnauthorizedException("User is disabled");
        }
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse ownerLogin(LoginRequest request) {
        AuthResponse response = login(request);
        if (response.user().role() != UserRole.OWNER) {
            throw new UnauthorizedException("Owner credentials required");
        }
        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        try {
            String refreshToken = request.refreshToken();
            if (!jwtService.isRefreshToken(refreshToken)) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            String email = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

            AppUserPrincipal principal = AppUserPrincipal.from(user);
            if (!jwtService.isTokenValid(refreshToken, principal)) {
                throw new UnauthorizedException("Refresh token has expired or is invalid");
            }
            return buildAuthResponse(user);
        } catch (UnauthorizedException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    public void logout() {
    }

    private AuthResponse buildAuthResponse(User user) {
        AppUserPrincipal principal = AppUserPrincipal.from(user);
        String accessToken = jwtService.generateAccessToken(principal, user.getId().toString(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(principal, user.getId().toString(), user.getRole().name());
        return new AuthResponse(responseMapper.toUserResponse(user), accessToken, refreshToken);
    }
}
