package com.datascope.domain.service;

import com.datascope.domain.model.User;
import com.datascope.domain.vo.LoginRequest;
import com.datascope.domain.vo.LoginResponse;

public interface AuthService {
    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应
     */
    LoginResponse login(LoginRequest request);

    /**
     * 用户登出
     */
    void logout();

    /**
     * 获取当前用户信息
     *
     * @return 用户信息
     */
    User getCurrentUser();
} 