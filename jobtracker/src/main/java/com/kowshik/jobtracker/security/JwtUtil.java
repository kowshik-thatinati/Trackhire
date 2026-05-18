package com.kowshik.jobtracker.security;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    private static final String SECRET = System.getenv("JWT_SECRET");
    private static final Key key;
    
    static {
        if (SECRET == null || SECRET.trim().isEmpty()) {
            throw new IllegalStateException("FATAL: JWT_SECRET environment variable is missing. It is required for application security.");
        }
        if (SECRET.length() < 32) {
            throw new IllegalStateException("FATAL: JWT_SECRET must be at least 32 characters long.");
        }
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