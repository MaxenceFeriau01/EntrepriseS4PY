package com.s4p.entreprise.repository;

import com.s4p.entreprise.model.LeaveRequest;
import com.s4p.entreprise.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByUser(User user);
    
    List<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status);
    
    List<LeaveRequest> findByUserAndStatus(User user, LeaveRequest.LeaveStatus status);
    
    List<LeaveRequest> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<LeaveRequest> findByUserOrderByCreatedAtDesc(User user);
}