package com.kowshik.jobtracker.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kowshik.jobtracker.entity.User;
import com.kowshik.jobtracker.exception.UserAlreadyExistsException;
import com.kowshik.jobtracker.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(String email, String password) {

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        
        return userRepository.save(user);


        
    }
    public User login(String email, String password) {

    Optional<User> userOpt = userRepository.findByEmail(email);

    if (userOpt.isEmpty()) {
        throw new RuntimeException("User not found");
    }

    User user = userOpt.get();

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    return user;
}
}