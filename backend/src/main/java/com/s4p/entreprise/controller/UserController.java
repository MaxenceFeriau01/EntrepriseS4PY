package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.ChangePasswordRequest;
import com.s4p.entreprise.dto.UserDTO;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.UserRepository;
import com.s4p.entreprise.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Obtenir tous les utilisateurs
     * Accessible à tous les utilisateurs authentifiés
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        System.out.println("📋 GET /users - Récupération de tous les utilisateurs");
        List<UserDTO> users = userService.getAllUsers();
        System.out.println("✅ " + users.size() + " utilisateurs trouvés");
        return ResponseEntity.ok(users);
    }

    /**
     * Obtenir l'utilisateur actuellement connecté
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        System.out.println("👤 GET /users/me - Récupération de l'utilisateur actuel");
        UserDTO user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    /**
     * Obtenir un utilisateur par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        System.out.println("🔍 GET /users/" + id);
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Obtenir les utilisateurs actifs
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserDTO>> getActiveUsers() {
        System.out.println("✅ GET /users/active");
        List<UserDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Obtenir les utilisateurs par département
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<List<UserDTO>> getUsersByDepartment(@PathVariable String department) {
        System.out.println("🏢 GET /users/department/" + department);
        List<UserDTO> users = userService.getUsersByDepartment(department);
        return ResponseEntity.ok(users);
    }

    /**
     * Obtenir les utilisateurs par rôle
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        System.out.println("🔐 GET /users/role/" + role);
        User.Role userRole = User.Role.valueOf(role.toUpperCase());
        List<UserDTO> users = userService.getUsersByRole(userRole);
        return ResponseEntity.ok(users);
    }

    /**
     * Mettre à jour un utilisateur
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        System.out.println("📝 PUT /users/" + id);
        UserDTO updated = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Changer le mot de passe de l'utilisateur avec validation de l'ancien
     * NOUVEAU - Sécurisé avec validation de l'ancien mot de passe
     */
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @RequestBody ChangePasswordRequest request) {
        
        System.out.println("🔐 POST /users/" + userId + "/change-password");
        Map<String, String> response = new HashMap<>();
        
        try {
            // Vérifier que l'utilisateur existe
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Vérifier l'ancien mot de passe
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                System.out.println("❌ Ancien mot de passe incorrect");
                response.put("message", "Ancien mot de passe incorrect");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Vérifier que le nouveau mot de passe est différent
            if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                System.out.println("❌ Le nouveau mot de passe doit être différent");
                response.put("message", "Le nouveau mot de passe doit être différent de l'ancien");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Vérifier la longueur du nouveau mot de passe
            if (request.getNewPassword().length() < 6) {
                System.out.println("❌ Mot de passe trop court");
                response.put("message", "Le nouveau mot de passe doit contenir au moins 6 caractères");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Changer le mot de passe
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            System.out.println("✅ Mot de passe changé avec succès pour l'utilisateur " + userId);
            response.put("message", "Mot de passe changé avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("❌ Erreur lors du changement de mot de passe: " + e.getMessage());
            response.put("message", "Erreur lors du changement de mot de passe: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Supprimer un utilisateur (admin uniquement)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        System.out.println("🗑️ DELETE /users/" + id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}