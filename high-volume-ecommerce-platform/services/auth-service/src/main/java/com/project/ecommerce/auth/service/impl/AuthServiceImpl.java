package com.project.ecommerce.auth.service.impl;

import com.project.ecommerce.auth.dto.LoginRequest;
import com.project.ecommerce.auth.dto.LoginResponse;
import com.project.ecommerce.auth.dto.RegisterRequest;
import com.project.ecommerce.auth.entity.Role;
import com.project.ecommerce.auth.entity.User;
import com.project.ecommerce.auth.repository.UserRepository;
import com.project.ecommerce.auth.security.JwtService;
import com.project.ecommerce.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@RequiredArgsConstructor
@Service

public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Role.CUSTOMER)
                .build();
        userRepository.save(user);

        return "User Registered Successfully";

    }
    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                "Login Successful",
                token
        );
    }
    }

