package com.syncboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class TaskCreateRequest {
    @NotBlank
    private String title;
    private String description;
    private String status = "TODO";
    private String priority = "MEDIUM";
    private String assignee = "Unassigned";
    private LocalDate dueDate;
    private List<String> checklistItems;
    private String authorEmail = "team@syncboard.internal";
}