package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.JwtAuthResponse;
import com.s4p.entreprise.dto.LoginRequest;
import com.s4p.entreprise.dto.RegisterRequest;
import com.s4p.entreprise.dto.UserDTO;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.UserRepository;
import com.s4p.entreprise.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new JwtAuthResponse(jwt, UserDTO.fromUser(user));
    }

    @Transactional
    public JwtAuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setPosition(registerRequest.getPosition());
        user.setDepartment(registerRequest.getDepartment());
        user.setRole(registerRequest.getRole());
        user.setActive(true);

        user = userRepository.save(user);

        // Créer l'authentification directement sans passer par authenticationManager
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String jwt = tokenProvider.generateToken(authentication);

        return new JwtAuthResponse(jwt, UserDTO.fromUser(user));
    }
}