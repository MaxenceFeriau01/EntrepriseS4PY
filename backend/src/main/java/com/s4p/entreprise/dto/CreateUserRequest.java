package com.s4p.entreprise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le prénom est obligatoire")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    private String lastName;

    private String phone;

    @NotBlank(message = "Le département est obligatoire")
    private String department;

    @NotBlank(message = "Le poste est obligatoire")
    private String position;

    @NotNull(message = "Le rôle est obligatoire")
    private String role; // EMPLOYEE, MANAGER, ou ADMIN

    private Integer vacationDays; // Optionnel, défaut = 25
}