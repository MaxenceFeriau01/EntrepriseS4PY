package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.LeaveRequestDTO;
import com.s4p.entreprise.model.LeaveRequest;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.LeaveRequestRepository;
import com.s4p.entreprise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(LeaveRequestDTO::fromLeaveRequest)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getLeaveRequestsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return leaveRequestRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(LeaveRequestDTO::fromLeaveRequest)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(LeaveRequest.LeaveStatus.PENDING).stream()
                .map(LeaveRequestDTO::fromLeaveRequest)
                .collect(Collectors.toList());
    }

    public LeaveRequestDTO getLeaveRequestById(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        return LeaveRequestDTO.fromLeaveRequest(leaveRequest);
    }

    @Transactional
    public LeaveRequestDTO createLeaveRequest(Long userId, LeaveRequestDTO leaveRequestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculer le nombre de jours
        long days = ChronoUnit.DAYS.between(leaveRequestDTO.getStartDate(), leaveRequestDTO.getEndDate()) + 1;

        // Vérifier si l'utilisateur a assez de jours de congés
        if (leaveRequestDTO.getLeaveType() == LeaveRequest.LeaveType.PAID_LEAVE && user.getVacationDays() < days) {
            throw new RuntimeException("Not enough vacation days available");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(user);
        leaveRequest.setStartDate(leaveRequestDTO.getStartDate());
        leaveRequest.setEndDate(leaveRequestDTO.getEndDate());
        leaveRequest.setLeaveType(leaveRequestDTO.getLeaveType());
        leaveRequest.setReason(leaveRequestDTO.getReason());
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestDTO.fromLeaveRequest(leaveRequest);
    }

    @Transactional
    public LeaveRequestDTO approveLeaveRequest(Long id, Long approverId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovedAt(LocalDateTime.now());

        // Déduire les jours de congés si c'est un congé payé
        if (leaveRequest.getLeaveType() == LeaveRequest.LeaveType.PAID_LEAVE) {
            User user = leaveRequest.getUser();
            long days = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
            user.setVacationDays(user.getVacationDays() - (int) days);
            userRepository.save(user);
        }

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestDTO.fromLeaveRequest(leaveRequest);
    }

    @Transactional
    public LeaveRequestDTO rejectLeaveRequest(Long id, Long approverId, String reason) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        leaveRequest.setRejectionReason(reason);

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestDTO.fromLeaveRequest(leaveRequest);
    }

    @Transactional
    public void deleteLeaveRequest(Long id) {
        leaveRequestRepository.deleteById(id);
    }
}