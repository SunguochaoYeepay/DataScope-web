package com.datascope.domain.model;

import lombok.Data;

import java.util.List;

@Data
public class User {
    private String id;
    private String username;
    private String email;
    private List<String> roles;
    private List<String> permissions;
} 