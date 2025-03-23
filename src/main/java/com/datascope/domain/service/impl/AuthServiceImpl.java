package com.datascope.domain.service.impl;

import com.datascope.domain.model.User;
import com.datascope.domain.service.AuthService;
import com.datascope.domain.vo.LoginRequest;
import com.datascope.domain.vo.LoginResponse;
import com.datascope.infrastructure.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(LoginRequest request) {
        // 暂时使用硬编码的用户信息
        if ("admin".equals(request.getUsername()) && "admin123".equals(request.getPassword())) {
            User user = new User();
            user.setId("1");
            user.setUsername("admin");
            user.setEmail("admin@example.com");
            user.setRoles(Collections.singletonList("admin"));
            user.setPermissions(Arrays.asList("dashboard:view", "dashboard:edit"));

            String token = "mock-jwt-token"; // 暂时使用模拟的 token

            return new LoginResponse(token, user);
        }

        throw new RuntimeException("Invalid username or password");
    }

    @Override
    public void logout() {
        SecurityContextHolder.clearContext();
    }

    @Override
    public User getCurrentUser() {
        // 暂时返回硬编码的用户信息
        User user = new User();
        user.setId("1");
        user.setUsername("admin");
        user.setEmail("admin@example.com");
        user.setRoles(Collections.singletonList("admin"));
        user.setPermissions(Arrays.asList("dashboard:view", "dashboard:edit"));
        return user;
    }
} 