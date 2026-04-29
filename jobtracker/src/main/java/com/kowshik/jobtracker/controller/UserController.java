package com.kowshik.jobtracker.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @GetMapping("/test")
    public String userTest() {
        return "User access";
    }
}