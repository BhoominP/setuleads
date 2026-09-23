package com.setuleads.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();

        String url = System.getenv("SPRING_DATASOURCE_URL");
        if (url == null || url.trim().isEmpty()) {
            url = System.getenv("DATABASE_URL");
        }

        if (url != null && !url.trim().isEmpty()) {
            url = url.trim();
            // Automatically transform Render / Heroku postgres:// or postgresql:// to Java JDBC format
            if (url.startsWith("postgres://")) {
                url = "jdbc:postgresql://" + url.substring("postgres://".length());
            } else if (url.startsWith("postgresql://") && !url.startsWith("jdbc:postgresql://")) {
                url = "jdbc:postgresql://" + url.substring("postgresql://".length());
            }
            properties.setUrl(url);

            String username = System.getenv("SPRING_DATASOURCE_USERNAME");
            if (username == null || username.trim().isEmpty()) {
                username = System.getenv("DATABASE_USERNAME");
            }
            if (username != null && !username.trim().isEmpty()) {
                properties.setUsername(username.trim());
            }

            String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
            if (password == null) {
                password = System.getenv("DATABASE_PASSWORD");
            }
            if (password != null) {
                properties.setPassword(password);
            }

            properties.setDriverClassName("org.postgresql.Driver");
        } else {
            // Local Development Fallback: In-Memory H2 Database
            properties.setUrl("jdbc:h2:mem:setuleads;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
            properties.setUsername("sa");
            properties.setPassword("");
            properties.setDriverClassName("org.h2.Driver");
        }

        return properties;
    }
}
