package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.AttendanceDTO;
import com.s4p.entreprise.model.Attendance;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.AttendanceRepository;
import com.s4p.entreprise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AttendanceDTO> getAllAttendances() {
        return attendanceRepository.findAll().stream()
                .map(AttendanceDTO::fromAttendance)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendancesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return attendanceRepository.findByUser(user).stream()
                .map(AttendanceDTO::fromAttendance)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendancesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return attendanceRepository.findByUserAndDateBetween(user, startDate, endDate).stream()
                .map(AttendanceDTO::fromAttendance)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO createAttendance(Long userId, AttendanceDTO attendanceDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Vérifier si une présence existe déjà pour cette date
        attendanceRepository.findByUserAndDate(user, attendanceDTO.getDate())
                .ifPresent(a -> {
                    throw new RuntimeException("Attendance already exists for this date");
                });

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setDate(attendanceDTO.getDate());
        attendance.setCheckIn(attendanceDTO.getCheckIn());
        attendance.setCheckOut(attendanceDTO.getCheckOut());
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setNotes(attendanceDTO.getNotes());

        attendance = attendanceRepository.save(attendance);
        return AttendanceDTO.fromAttendance(attendance);
    }

    @Transactional
    public AttendanceDTO checkIn(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByUserAndDate(user, today)
                .orElse(new Attendance());

        attendance.setUser(user);
        attendance.setDate(today);
        attendance.setCheckIn(LocalTime.now());
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        attendance = attendanceRepository.save(attendance);
        return AttendanceDTO.fromAttendance(attendance);
    }

    @Transactional
    public AttendanceDTO checkOut(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByUserAndDate(user, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        attendance.setCheckOut(LocalTime.now());
        attendance = attendanceRepository.save(attendance);
        return AttendanceDTO.fromAttendance(attendance);
    }

    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO attendanceDTO) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));

        attendance.setCheckIn(attendanceDTO.getCheckIn());
        attendance.setCheckOut(attendanceDTO.getCheckOut());
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setNotes(attendanceDTO.getNotes());

        attendance = attendanceRepository.save(attendance);
        return AttendanceDTO.fromAttendance(attendance);
    }

    @Transactional
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
}