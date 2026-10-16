package com.syncboard.dto;

public record AuthResponse(String token, String email, String fullName) {}