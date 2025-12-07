package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.CreateUserRequest;
import com.s4p.entreprise.dto.UserDTO;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ========================================
    // AUTHENTICATION
    // ========================================

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + email));
    }

    // ========================================
    // LECTURE (GET)
    // ========================================

    /**
     * Obtenir tous les utilisateurs
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir un utilisateur par son ID
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));
        return convertToDTO(user);
    }

    /**
     * Obtenir l'utilisateur actuellement connecté
     */
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Aucun utilisateur connecté");
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return convertToDTO(user);
    }

    /**
     * Obtenir les utilisateurs actifs
     */
    public List<UserDTO> getActiveUsers() {
        return userRepository.findAll().stream()
                .filter(User::getActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir les utilisateurs par département
     */
    public List<UserDTO> getUsersByDepartment(String department) {
        return userRepository.findAll().stream()
                .filter(user -> department.equalsIgnoreCase(user.getDepartment()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtenir les utilisateurs par rôle
     */
    public List<UserDTO> getUsersByRole(User.Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Vérifier si un email existe déjà
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // ========================================
    // CRÉATION
    // ========================================

    /**
     * Créer un nouvel utilisateur (utilisé par AdminController)
     */
    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        // Créer le nouvel utilisateur
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setPosition(request.getPosition());
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setVacationDays(request.getVacationDays() != null ? request.getVacationDays() : 25);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // ========================================
    // MISE À JOUR
    // ========================================

    /**
     * Mettre à jour un utilisateur
     */
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Mettre à jour les champs
        if (userDTO.getFirstName() != null) user.setFirstName(userDTO.getFirstName());
        if (userDTO.getLastName() != null) user.setLastName(userDTO.getLastName());
        if (userDTO.getPhone() != null) user.setPhone(userDTO.getPhone());
        if (userDTO.getDepartment() != null) user.setDepartment(userDTO.getDepartment());
        if (userDTO.getPosition() != null) user.setPosition(userDTO.getPosition());
        if (userDTO.getVacationDays() != null) user.setVacationDays(userDTO.getVacationDays());
        
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    /**
     * Désactiver un utilisateur
     */
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Activer un utilisateur
     */
    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Réinitialiser le mot de passe d'un utilisateur
     */
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // ========================================
    // SUPPRESSION
    // ========================================

    /**
     * Supprimer un utilisateur
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    /**
     * Convertir User en UserDTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setDepartment(user.getDepartment());
        dto.setPosition(user.getPosition());
        dto.setRole(user.getRole().name()); // Convertit User.Role en String
        dto.setVacationDays(user.getVacationDays());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}