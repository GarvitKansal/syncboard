package com.syncboard.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_task_status", columnList = "status"),
        @Index(name = "idx_task_due_date", columnList = "dueDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status; // TODO, IN_PROGRESS, DONE

    @Column(nullable = false)
    @Builder.Default
    private String priority = "MEDIUM";

    private String assignee;

    private LocalDate dueDate;

    @Column(nullable = false)
    private Integer position;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_checklists", joinColumns = @JoinColumn(name = "task_id"))
    @Builder.Default
    private List<ChecklistItem> checklist = new ArrayList<>();

    @Version
    private Long version;
}