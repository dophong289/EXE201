package com.goimay.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Chạy các ALTER TABLE nhỏ để tránh lỗi ENUM khi thêm trạng thái mới.
 * Vì spring.jpa.hibernate.ddl-auto=update thường KHÔNG mở rộng ENUM của MySQL.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SchemaMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL");
        } catch (Exception e) {
            log.debug("Skip migrate orders.status: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(20) NOT NULL");
        } catch (Exception e) {
            log.debug("Skip migrate orders.payment_method: {}", e.getMessage());
        }
    }
}

