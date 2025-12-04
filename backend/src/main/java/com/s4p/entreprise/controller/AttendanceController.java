package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.AttendanceDTO;
import com.s4p.entreprise.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendances")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendances() {
        return ResponseEntity.ok(attendanceService.getAllAttendances());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendancesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.getAttendancesByUser(userId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<AttendanceDTO>> getAttendancesByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendancesByDateRange(userId, startDate, endDate));
    }

    @PostMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AttendanceDTO> createAttendance(
            @PathVariable Long userId,
            @RequestBody AttendanceDTO attendanceDTO) {
        return ResponseEntity.ok(attendanceService.createAttendance(userId, attendanceDTO));
    }

    @PostMapping("/check-in/{userId}")
    public ResponseEntity<AttendanceDTO> checkIn(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.checkIn(userId));
    }

    @PostMapping("/check-out/{userId}")
    public ResponseEntity<AttendanceDTO> checkOut(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.checkOut(userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AttendanceDTO> updateAttendance(
            @PathVariable Long id,
            @RequestBody AttendanceDTO attendanceDTO) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, attendanceDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}