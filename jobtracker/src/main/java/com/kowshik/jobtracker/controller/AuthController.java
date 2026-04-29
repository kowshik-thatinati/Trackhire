package com.kowshik.jobtracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kowshik.jobtracker.dto.RegisterRequest;
import com.kowshik.jobtracker.dto.UserResponse;
import com.kowshik.jobtracker.entity.User;
import com.kowshik.jobtracker.security.JwtUtil;
import com.kowshik.jobtracker.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {

        User user = userService.register(
                request.getEmail(),
                request.getPassword()
        );

        return new UserResponse(user.getId(), user.getEmail());
    }
    @PostMapping("/login")
    public String login(@RequestBody User user) {
        User loggedInUser = userService.login(user.getEmail(), user.getPassword());

    return JwtUtil.generateToken(loggedInUser.getEmail());

}
     @GetMapping("/secure")
    public String secure() {
        return "You are authenticated!";
    }
    @GetMapping("test")
    public String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    
}