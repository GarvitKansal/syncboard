package com.syncboard.controller;

import com.syncboard.dto.*;
import com.syncboard.model.Task;
import com.syncboard.model.TaskActivity;
import com.syncboard.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/activities")
    public ResponseEntity<List<TaskActivity>> getActivities() {
        return ResponseEntity.ok(taskService.getRecentActivities());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody @Valid TaskCreateRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @PostMapping("/move")
    public ResponseEntity<Task> moveTask(@RequestBody @Valid TaskMoveRequest request) {
        return ResponseEntity.ok(taskService.moveTask(request));
    }

    @PostMapping("/checklist/toggle")
    public ResponseEntity<Task> toggleChecklist(@RequestBody @Valid ChecklistToggleRequest request) {
        return ResponseEntity.ok(taskService.toggleChecklistItem(request));
    }
}