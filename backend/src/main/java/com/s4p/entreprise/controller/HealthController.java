package com.s4p.entreprise.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend EntrepriseS4PY fonctionne parfaitement !");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> welcome() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bienvenue sur l'API EntrepriseS4PY");
        response.put("documentation", "/api/docs");
        return ResponseEntity.ok(response);
    }
}