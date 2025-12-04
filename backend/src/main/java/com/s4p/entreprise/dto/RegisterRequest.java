package com.s4p.entreprise.dto;

import com.s4p.entreprise.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String firstName;
    
    @NotBlank(message = "Le nom est obligatoire")
    private String lastName;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;
    
    @NotBlank(message = "Le téléphone est obligatoire")
    private String phone;
    
    @NotBlank(message = "Le poste est obligatoire")
    private String position;
    
    @NotBlank(message = "Le département est obligatoire")
    private String department;
    
    private User.Role role = User.Role.EMPLOYEE;
}