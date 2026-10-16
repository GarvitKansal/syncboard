package com.syncboard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "task_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String action; // CREATED, STATUS_CHANGED, CHECKLIST_TOGGLED

    @Column(nullable = false)
    private String details;

    @Column(nullable = false)
    private Instant timestamp;
}