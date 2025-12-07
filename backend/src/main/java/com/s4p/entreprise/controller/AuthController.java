package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.JwtAuthResponse;
import com.s4p.entreprise.dto.LoginRequest;
import com.s4p.entreprise.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")  // ← SANS /api car context path = /api
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login endpoint - Accessible à tous
     * URL complète : http://localhost:8080/api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtAuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email ou mot de passe incorrect");
        }
    }

    /**
     * Note: Pas de endpoint /register public
     * Les comptes utilisateurs sont créés uniquement par les administrateurs
     * via /admin/users (voir AdminController)
     */
}