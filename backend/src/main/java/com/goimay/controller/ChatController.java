package com.goimay.controller;

import com.goimay.dto.ChatRequest;
import com.goimay.dto.ChatResponse;
import com.goimay.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String response = chatService.processMessage(request.getMessage(), request.getProducts());
            return ResponseEntity.ok(new ChatResponse(response, response));
        } catch (Exception e) {
            return ResponseEntity.ok(new ChatResponse(
                "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
                "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau."
            ));
        }
    }
}
