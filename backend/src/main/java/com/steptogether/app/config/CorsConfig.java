package com.steptogether.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

<<<<<<< HEAD
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl == null) {
            frontendUrl = "http://localhost:3000"; // Default for development
        }
        registry.addMapping("/**")
                .allowedOrigins(frontendUrl)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
=======
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("https://step-together.vercel.app") // FE local
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
>>>>>>> 3d98cc74dadfd38b5ef48d7eed376a7d8fe7e59c
    }
}
