package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.UserDTO;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getActiveUsers() {
        return userRepository.findByActiveTrue().stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserDTO.fromUser(user);
    }

    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDTO.fromUser(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setPosition(userDTO.getPosition());
        user.setDepartment(userDTO.getDepartment());
        user.setRole(userDTO.getRole());
        user.setActive(userDTO.getActive());
        user.setVacationDays(userDTO.getVacationDays());

        user = userRepository.save(user);
        return UserDTO.fromUser(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    public List<UserDTO> getUsersByDepartment(String department) {
        return userRepository.findByDepartment(department).stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserDTO::fromUser)
                .collect(Collectors.toList());
    }
}