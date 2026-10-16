package com.syncboard.repository;

import com.syncboard.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    int countByStatus(String status);
    List<Task> findAllByOrderByPositionAsc();
}