package com.s4p.entreprise.dto;

import com.s4p.entreprise.model.LeaveRequest;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDTO {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveRequest.LeaveType leaveType;
    private String reason;
    private LeaveRequest.LeaveStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    
    public static LeaveRequestDTO fromLeaveRequest(LeaveRequest request) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setUserName(request.getUser().getFirstName() + " " + request.getUser().getLastName());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setLeaveType(request.getLeaveType());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        
        if (request.getApprovedBy() != null) {
            dto.setApprovedById(request.getApprovedBy().getId());
            dto.setApprovedByName(request.getApprovedBy().getFirstName() + " " + request.getApprovedBy().getLastName());
        }
        
        dto.setApprovedAt(request.getApprovedAt());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}