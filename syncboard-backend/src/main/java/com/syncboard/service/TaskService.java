package com.syncboard.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syncboard.dto.*;
import com.syncboard.model.*;
import com.syncboard.repository.*;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskActivityRepository activityRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByPositionAsc();
    }

    public List<TaskActivity> getRecentActivities() {
        return activityRepository.findTop30ByOrderByTimestampDesc();
    }

    @Transactional
    public Task createTask(TaskCreateRequest req) {
        List<ChecklistItem> checklist = (req.getChecklistItems() == null) ? List.of() :
                req.getChecklistItems().stream()
                        .filter(txt -> txt != null && !txt.isBlank())
                        .map(txt -> new ChecklistItem(UUID.randomUUID().toString(), txt, false))
                        .toList();

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : "TODO")
                .priority(req.getPriority() != null ? req.getPriority() : "MEDIUM")
                .assignee(req.getAssignee())
                .dueDate(req.getDueDate())
                .position(taskRepository.countByStatus(req.getStatus() != null ? req.getStatus() : "TODO"))
                .checklist(checklist)
                .build();

        Task saved = taskRepository.save(task);

        recordActivity(saved.getId(), req.getAuthorEmail(), "CREATED", "Created task: " + saved.getTitle());
        publishSyncEvent("CREATED", saved);
        return saved;
    }

    @Transactional
    public Task moveTask(TaskMoveRequest req) {
        Task task = taskRepository.findById(req.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + req.getTaskId()));

        if (!task.getVersion().equals(req.getClientVersion())) {
            throw new OptimisticLockException("Concurrent edit detected. Local task state is outdated.");
        }

        String oldStatus = task.getStatus();
        task.setStatus(req.getTargetStatus());
        task.setPosition(req.getTargetPosition());

        Task updated = taskRepository.saveAndFlush(task);

        recordActivity(updated.getId(), req.getAuthorEmail(), "STATUS_CHANGED",
                "Moved from " + oldStatus + " to " + req.getTargetStatus());
        publishSyncEvent("UPDATED", updated);
        return updated;
    }

    @Transactional
    public Task toggleChecklistItem(ChecklistToggleRequest req) {
        Task task = taskRepository.findById(req.getTaskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        task.getChecklist().stream()
                .filter(item -> item.getId().equals(req.getItemId()))
                .findFirst()
                .ifPresent(item -> {
                    item.setCompleted(!item.isCompleted());
                    recordActivity(task.getId(), req.getAuthorEmail(), "CHECKLIST_TOGGLED",
                            "Toggled checklist: " + item.getText());
                });

        Task updated = taskRepository.saveAndFlush(task);
        publishSyncEvent("UPDATED", updated);
        return updated;
    }

    private void recordActivity(Long taskId, String email, String action, String details) {
        TaskActivity activity = TaskActivity.builder()
                .taskId(taskId)
                .userEmail(email)
                .action(action)
                .details(details)
                .timestamp(Instant.now())
                .build();
        activityRepository.save(activity);
    }

    private void publishSyncEvent(String action, Task task) {
        try {
            TaskBroadcastEvent event = new TaskBroadcastEvent(action, task);
            String message = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend("task-events", message);
        } catch (Exception e) {
            System.err.println("Redis Pub/Sub broadcast skipped: " + e.getMessage());
        }
    }
}