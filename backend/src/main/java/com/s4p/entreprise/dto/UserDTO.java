package com.s4p.entreprise.dto;

import com.s4p.entreprise.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String position;
    private String department;
    private User.Role role;
    private Boolean active;
    private Integer vacationDays;
    private LocalDateTime createdAt;
    
    public static UserDTO fromUser(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setPosition(user.getPosition());
        dto.setDepartment(user.getDepartment());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setVacationDays(user.getVacationDays());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}