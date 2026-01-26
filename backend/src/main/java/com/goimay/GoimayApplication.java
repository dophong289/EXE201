package com.goimay;

import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GoimayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GoimayApplication.class, args);
    }
}

