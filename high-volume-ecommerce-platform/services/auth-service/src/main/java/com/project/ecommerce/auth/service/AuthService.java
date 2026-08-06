package com.project.ecommerce.auth.service;
import com.project.ecommerce.auth.dto.LoginRequest;
import com.project.ecommerce.auth.dto.RegisterRequest;
import com.project.ecommerce.auth.dto.LoginResponse;
public interface AuthService {
    String register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}


