package com.syncboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskMoveRequest {
    @NotNull
    private Long taskId;
    @NotBlank
    private String targetStatus;
    @NotNull
    private Integer targetPosition;
    @NotNull
    private Long clientVersion;
    private String authorEmail = "team@syncboard.internal";
}