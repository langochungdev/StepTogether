package com.steptogether.app.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.database-url:}")
    private String databaseUrl;

    @Value("${firebase.service-account:}")
    private String serviceAccountPath;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            // Skip Firebase initialization if no config provided
            if (databaseUrl == null || databaseUrl.isEmpty()) {
                System.out.println("Firebase not configured - skipping initialization");
                return null;
            }
            
            InputStream serviceAccount;
            
            try {
                // Try to load from classpath first
                ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
                serviceAccount = resource.getInputStream();
                
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setDatabaseUrl(databaseUrl)
                        .build();

                return FirebaseApp.initializeApp(options);
            } catch (Exception e) {
                System.err.println("Warning: Firebase service account not found: " + e.getMessage());
                return null;
            }
        } else {
            return FirebaseApp.getInstance();
        }
    }
}
