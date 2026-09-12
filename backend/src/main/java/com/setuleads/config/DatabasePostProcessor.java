package com.setuleads.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabasePostProcessor implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabasePostProcessor(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE leads ALTER COLUMN source TYPE VARCHAR(50) USING source::text");
        } catch (Exception ignored) {
            // Ignored if column is already VARCHAR or database is H2
        }

        try {
            jdbcTemplate.execute("ALTER TABLE leads ALTER COLUMN stage TYPE VARCHAR(50) USING stage::text");
        } catch (Exception ignored) {
            // Ignored if column is already VARCHAR or database is H2
        }

        try {
            jdbcTemplate.execute("ALTER TABLE activities ALTER COLUMN type TYPE VARCHAR(50) USING type::text");
        } catch (Exception ignored) {
            // Ignored if column is already VARCHAR or database is H2
        }
    }
}
