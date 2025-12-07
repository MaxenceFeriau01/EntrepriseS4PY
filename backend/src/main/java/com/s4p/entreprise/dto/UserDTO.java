package com.s4p.entreprise.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String department;
    private String position;
    private String role; // String et non User.Role (pour faciliter les transferts JSON)
    private Integer vacationDays;
    private Boolean active;
    private LocalDateTime createdAt;
}