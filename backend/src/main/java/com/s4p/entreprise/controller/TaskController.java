package com.s4p.entreprise.controller;

import com.s4p.entreprise.dto.TaskDTO;
import com.s4p.entreprise.model.Task;
import com.s4p.entreprise.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(@PathVariable Task.TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TaskDTO> createTask(
            @RequestBody TaskDTO taskDTO,
            @RequestParam Long createdById) {
        return ResponseEntity.ok(taskService.createTask(taskDTO, createdById));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Task.TaskStatus status = Task.TaskStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}