package com.s4p.entreprise.dto;

import com.s4p.entreprise.model.Task;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    
    public static TaskDTO fromTask(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setAssignedToId(task.getAssignedTo().getId());
        dto.setAssignedToName(task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName());
        dto.setCreatedById(task.getCreatedBy().getId());
        dto.setCreatedByName(task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        return dto;
    }
}