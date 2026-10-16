package com.syncboard.repository;

import com.syncboard.model.TaskActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskActivityRepository extends JpaRepository<TaskActivity, Long> {
    List<TaskActivity> findTop30ByOrderByTimestampDesc();
    List<TaskActivity> findByTaskIdOrderByTimestampDesc(Long taskId);
}