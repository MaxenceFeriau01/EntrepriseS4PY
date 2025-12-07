package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.UserDTO;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserService userService;

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