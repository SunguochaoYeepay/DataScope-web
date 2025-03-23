package com.datascope.controller;

import com.datascope.domain.model.User;
import com.datascope.domain.service.AuthService;
import com.datascope.domain.vo.LoginRequest;
import com.datascope.domain.vo.LoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Tag(name = "认证管理", description = "认证相关接口")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "用户登出")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/user/info")
    public ResponseEntity<User> getUserInfo() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
} 