package com.s4p.entreprise.service;

import com.s4p.entreprise.dto.TaskDTO;
import com.s4p.entreprise.model.Task;
import com.s4p.entreprise.model.User;
import com.s4p.entreprise.repository.TaskRepository;
import com.s4p.entreprise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(TaskDTO::fromTask)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedToOrderByDueDateAsc(user).stream()
                .map(TaskDTO::fromTask)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByStatus(Task.TaskStatus status) {
        return taskRepository.findByStatus(status).stream()
                .map(TaskDTO::fromTask)
                .collect(Collectors.toList());
    }

    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return TaskDTO.fromTask(task);
    }

    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO, Long createdById) {
        User assignedTo = userRepository.findById(taskDTO.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setAssignedTo(assignedTo);
        task.setCreatedBy(createdBy);
        task.setStatus(Task.TaskStatus.TODO);
        task.setPriority(taskDTO.getPriority() != null ? taskDTO.getPriority() : Task.TaskPriority.MEDIUM);
        task.setDueDate(taskDTO.getDueDate());

        task = taskRepository.save(task);
        return TaskDTO.fromTask(task);
    }

    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setStatus(taskDTO.getStatus());
        task.setPriority(taskDTO.getPriority());
        task.setDueDate(taskDTO.getDueDate());

        if (taskDTO.getStatus() == Task.TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        }

        task = taskRepository.save(task);
        return TaskDTO.fromTask(task);
    }

    @Transactional
    public TaskDTO updateTaskStatus(Long id, Task.TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(status);
        if (status == Task.TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        }

        task = taskRepository.save(task);
        return TaskDTO.fromTask(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}