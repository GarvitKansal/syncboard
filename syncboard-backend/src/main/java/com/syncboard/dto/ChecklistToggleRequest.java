package com.syncboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChecklistToggleRequest {
    @NotNull
    private Long taskId;
    @NotBlank
    private String itemId;
    private String authorEmail = "team@syncboard.internal";
}