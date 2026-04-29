package com.kowshik.jobtracker.controller;

import com.kowshik.jobtracker.dto.JobRequest;
import com.kowshik.jobtracker.entity.Job;
import com.kowshik.jobtracker.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public Job addJob(@RequestBody JobRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return jobService.addJob(email, request.getCompany(), request.getRole());
    }

    @GetMapping
    public List<Job> getJobs() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return jobService.getJobs(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody JobStatusRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Job updated = jobService.updateJob(id, email, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        jobService.deleteJob(id, email);
        return ResponseEntity.ok("Job deleted successfully");
    }

    public static class JobStatusRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}