package com.goimay.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class KeepAliveScheduler {

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Ping every 10 minutes (600,000 ms)
    @Scheduled(fixedRate = 600000)
    public void pingSelf() {
        if (renderExternalUrl == null || renderExternalUrl.isEmpty()) {
            log.info("RENDER_EXTERNAL_URL not set. Skipping keep-alive ping.");
            return;
        }

        String pingUrl = renderExternalUrl + "/api/products?page=0&size=1";
        try {
            log.info("Sending keep-alive ping to: {}", pingUrl);
            restTemplate.getForEntity(pingUrl, String.class);
            log.info("Keep-alive ping successful.");
        } catch (Exception e) {
            log.error("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
