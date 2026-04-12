package com.giva.service;

import com.giva.config.AppUserPrincipal;
import com.giva.exception.ResourceNotFoundException;
import com.giva.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userRepository.findByEmailIgnoreCase(username)
            .map(AppUserPrincipal::from)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
