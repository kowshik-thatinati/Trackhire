package com.kowshik.jobtracker.controller;

import com.kowshik.jobtracker.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<Job>> addJob(@RequestBody JobRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Job job = jobService.addJob(email, request.getCompany(), request.getTitle(), request.getLocation());
        return ResponseEntity.ok(ApiResponse.ok(job));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Job>>> getJobs() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Job> jobs = jobService.getJobs(email);
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> updateJob(@PathVariable Long id,
                                                       @RequestBody JobStatusRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Job updated = jobService.updateJob(id, email, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteJob(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        jobService.deleteJob(id, email);
        return ResponseEntity.ok(ApiResponse.ok("Job deleted successfully"));
    }

    public static class JobStatusRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}