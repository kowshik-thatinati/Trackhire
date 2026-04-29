package com.kowshik.jobtracker.service;

import com.kowshik.jobtracker.entity.Job;
import com.kowshik.jobtracker.entity.User;
import com.kowshik.jobtracker.repository.JobRepository;
import com.kowshik.jobtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public Job addJob(String email, String company, String role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = new Job();
        job.setCompany(company);
        job.setRole(role);
        job.setStatus("APPLIED");
        job.setAppliedDate(LocalDate.now());
        job.setUser(user);

        return jobRepository.save(job);
    }

    public List<Job> getJobs(String email) {
        return jobRepository.findByUserEmail(email);
    }

    public Job updateJob(Long id, String email, String status) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        // Ensure job belongs to the authenticated user
        if (!job.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this job");
        }

        job.setStatus(status);
        return jobRepository.save(job);
    }

    public void deleteJob(Long id, String email) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        // Ensure job belongs to the authenticated user
        if (!job.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this job");
        }

        jobRepository.delete(job);
    }
}