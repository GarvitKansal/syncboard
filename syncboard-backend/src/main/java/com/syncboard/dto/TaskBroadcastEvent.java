package com.syncboard.dto;

import com.syncboard.model.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskBroadcastEvent {
    private String action; // CREATED, UPDATED, DELETED
    private Task task;
}