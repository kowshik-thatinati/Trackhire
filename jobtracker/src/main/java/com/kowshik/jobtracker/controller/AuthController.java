package com.kowshik.jobtracker.controller;

import com.kowshik.jobtracker.dto.ApiResponse;
import com.kowshik.jobtracker.dto.RegisterRequest;
import com.kowshik.jobtracker.dto.UserResponse;
import com.kowshik.jobtracker.entity.User;
import com.kowshik.jobtracker.security.JwtUtil;
import com.kowshik.jobtracker.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request.getEmail(), request.getPassword());
            log.info("[AUTH] Registration success for: {}", maskEmail(request.getEmail()));
            UserResponse body = new UserResponse(user.getId(), user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(body));
        } catch (Exception e) {
            log.warn("[AUTH] Registration failed for: {} — {}", maskEmail(request.getEmail()), e.getMessage());
            throw e; // Handled by GlobalExceptionHandler
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestBody RegisterRequest request) {
        log.info("[DIAG] login endpoint entered");
        try {
            log.info("[DIAG] request email={}", request.getEmail());
            
            log.info("[DIAG] starting user lookup and password verification");
            User loggedInUser = userService.login(request.getEmail(), request.getPassword());
            log.info("[DIAG] password verification passed for user id={}", loggedInUser != null ? loggedInUser.getId() : "null");
            
            log.info("[DIAG] entering JWT generation");
            String token = JwtUtil.generateToken(loggedInUser.getEmail());
            log.info("[DIAG] JWT generation completed");
            
            log.info("[DIAG] preparing response");
            return ResponseEntity.ok(ApiResponse.ok(token));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.warn("[AUTH] Login FAILED for: {} - Bad Credentials", maskEmail(request.getEmail()));
            throw e; 
        } catch (Exception ex) {
            log.error("[DIAG] LOGIN FAILURE", ex);
            throw ex; 
        }
    }

    /** Partially masks an email for safe logging — e.g. "ko***@gmail.com" */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@", 2);
        String local = parts[0];
        String visible = local.length() > 2 ? local.substring(0, 2) : local;
        return visible + "***@" + parts[1];
    }
}