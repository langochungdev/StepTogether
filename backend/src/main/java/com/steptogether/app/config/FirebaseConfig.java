package com.steptogether.app.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.file}")
    private String firebaseConfigPath;

    @Bean
    public Firestore firestore() throws IOException {
        // load service account key từ file resources
        InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream(firebaseConfigPath);

        if (serviceAccount == null) {
            throw new IllegalStateException("Không tìm thấy file Firebase service account: " + firebaseConfigPath);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }

        return FirestoreClient.getFirestore();
    }
}
