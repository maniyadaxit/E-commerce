package com.giva.service;

import com.giva.config.AppUserPrincipal;
import com.giva.exception.UnauthorizedException;
import com.giva.model.User;
import com.giva.repository.UserRepository;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUserPrincipal principal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new UnauthorizedException("Authentication required");
        }
        return principal;
    }

    public UUID userId() {
        return principal().id();
    }

    public User user() {
        return userRepository.findById(userId())
            .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }
}
