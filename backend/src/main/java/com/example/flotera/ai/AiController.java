package com.example.flotera.ai;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("api/ai")
public class AiController {
    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }
@PostMapping("/chat")
public String chat(@RequestBody Map<String, String> body) {
    String userMessage = body.get("message");
    return aiService.generateResponse(userMessage);
}
}
