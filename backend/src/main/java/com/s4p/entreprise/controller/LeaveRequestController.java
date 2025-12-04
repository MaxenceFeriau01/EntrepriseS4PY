package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.LeaveRequestDTO;
import com.s4p.entreprise.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leave-requests")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveRequestDTO>> getPendingLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getPendingLeaveRequests());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LeaveRequestDTO>> getLeaveRequestsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequestDTO> getLeaveRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestById(id));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<LeaveRequestDTO> createLeaveRequest(
            @PathVariable Long userId,
            @RequestBody LeaveRequestDTO leaveRequestDTO) {
        return ResponseEntity.ok(leaveRequestService.createLeaveRequest(userId, leaveRequestDTO));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDTO> approveLeaveRequest(
            @PathVariable Long id,
            @RequestParam Long approverId) {
        return ResponseEntity.ok(leaveRequestService.approveLeaveRequest(id, approverId));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveRequestDTO> rejectLeaveRequest(
            @PathVariable Long id,
            @RequestParam Long approverId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(leaveRequestService.rejectLeaveRequest(id, approverId, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable Long id) {
        leaveRequestService.deleteLeaveRequest(id);
        return ResponseEntity.noContent().build();
    }
}