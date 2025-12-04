package com.s4p.entreprise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserDTO user;
    
    public JwtAuthResponse(String accessToken, UserDTO user) {
        this.accessToken = accessToken;
        this.user = user;
    }
}