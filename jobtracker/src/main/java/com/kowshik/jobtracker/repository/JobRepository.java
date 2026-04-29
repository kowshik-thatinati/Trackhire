package com.kowshik.jobtracker.repository;

import com.kowshik.jobtracker.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByUserEmail(String email);
}