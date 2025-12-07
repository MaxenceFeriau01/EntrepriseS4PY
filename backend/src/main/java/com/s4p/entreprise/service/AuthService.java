package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.JwtAuthResponse;
import com.s4p.entreprise.dto.LoginRequest;
import com.s4p.entreprise.dto.UserDTO;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.UserRepository;
import com.s4p.entreprise.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    /**
     * Authentifier un utilisateur et générer un token JWT
     */
    public JwtAuthResponse login(LoginRequest loginRequest) {
        // Authentifier l'utilisateur
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Mettre l'authentification dans le contexte de sécurité
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Générer le token JWT
        String token = jwtTokenProvider.generateToken(authentication);

        // Récupérer les informations de l'utilisateur
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Convertir User en UserDTO
        UserDTO userDTO = convertToDTO(user);

        // Créer et retourner la réponse
        return new JwtAuthResponse(token, userDTO);
    }

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
        dto.setRole(user.getRole().name());
        dto.setVacationDays(user.getVacationDays());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}