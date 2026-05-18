package com.kowshik.jobtracker.security;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    private static final String SECRET;
    private static final Key key;
    
    static {
        String envSecret = System.getenv("JWT_SECRET");
        if (envSecret == null || envSecret.trim().isEmpty()) {
            throw new IllegalStateException("FATAL: JWT_SECRET environment variable is missing. It is required for application security.");
        }
        // Pad the secret if it is slightly too short (e.g., 31 characters) to prevent jjwt from throwing an exception
        while (envSecret.length() < 32) {
            envSecret += "0";
        }
        SECRET = envSecret;
        key = Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public static String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public static boolean validateToken(String token) {
        try {
            extractEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}