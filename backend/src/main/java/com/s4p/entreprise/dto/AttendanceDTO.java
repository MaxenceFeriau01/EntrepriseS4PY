package com.s4p.entreprise.dto;

import com.s4p.entreprise.model.Attendance;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceDTO {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;
    private Attendance.AttendanceStatus status;
    private String notes;
    
    public static AttendanceDTO fromAttendance(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setUserId(attendance.getUser().getId());
        dto.setUserName(attendance.getUser().getFirstName() + " " + attendance.getUser().getLastName());
        dto.setDate(attendance.getDate());
        dto.setCheckIn(attendance.getCheckIn());
        dto.setCheckOut(attendance.getCheckOut());
        dto.setStatus(attendance.getStatus());
        dto.setNotes(attendance.getNotes());
        return dto;
    }
}