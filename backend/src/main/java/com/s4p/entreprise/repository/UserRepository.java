package com.s4p.entreprise.repository;

import com.s4p.entreprise.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByActiveTrue();
    
    List<User> findByRole(User.Role role);
    
    List<User> findByDepartment(String department);
}