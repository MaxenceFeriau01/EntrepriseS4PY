package com.s4p.entreprise.repository;

import com.s4p.entreprise.model.Attendance;
import com.s4p.entreprise.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByUser(User user);
    
    List<Attendance> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    Optional<Attendance> findByUserAndDate(User user, LocalDate date);
    
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Attendance> findByStatus(Attendance.AttendanceStatus status);
}