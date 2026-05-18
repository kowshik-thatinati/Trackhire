package com.kowshik.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class JobtrackerApplication {

    @Autowired
    private Environment env;

    @Autowired
    private DataSource dataSource;

    public static void main(String[] args) {
        SpringApplication.run(JobtrackerApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        System.out.println("=========================================================");
        System.out.println("🚀 APPLICATION STARTED SUCCESSFULLY 🚀");
        System.out.println("=========================================================");
        System.out.println("Active Profiles: " + String.join(", ", env.getActiveProfiles()));
        System.out.println("Server Port: " + env.getProperty("server.port"));
        
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("Database Status: CONNECTED");
            System.out.println("Database URL: " + conn.getMetaData().getURL());
        } catch (Exception e) {
            System.out.println("Database Status: FAILED - " + e.getMessage());
        }
        System.out.println("=========================================================");
    }
}
