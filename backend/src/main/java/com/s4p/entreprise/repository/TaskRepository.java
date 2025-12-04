package com.s4p.entreprise.repository;

import com.s4p.entreprise.model.Task;
import com.s4p.entreprise.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByAssignedTo(User user);
    
    List<Task> findByCreatedBy(User user);
    
    List<Task> findByStatus(Task.TaskStatus status);
    
    List<Task> findByAssignedToAndStatus(User user, Task.TaskStatus status);
    
    List<Task> findByDueDateBefore(LocalDate date);
    
    List<Task> findByAssignedToOrderByDueDateAsc(User user);
    
    List<Task> findByPriority(Task.TaskPriority priority);
}