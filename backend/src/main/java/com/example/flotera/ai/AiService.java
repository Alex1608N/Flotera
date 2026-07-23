package com.example.flotera.ai;


    import org.springframework.stereotype.Service;                                                                                          
    import org.springframework.web.client.RestTemplate;                                                                                     
    import java.util.Map;                                                                                                                   
    import java.util.HashMap;                                                                                                               
    import org.springframework.http.HttpEntity;                                                                                             
    import org.springframework.http.HttpHeaders;                                                                                            
    import org.springframework.http.MediaType;                                                                                              
    import org.springframework.beans.factory.annotation.Value;                                                                              
    import org.springframework.scheduling.annotation.Async;
    import java.util.List;
    import java.util.ArrayList;

@Service
public class AiService {                                                                                                             
        private final RestTemplate restTemplate;                                                                                            
                                                                                                                                            
        @Value("${gemini.api.key}")                                                                                                             
        private String apiKey;                                                                                                              
                                                                                                                                            
        public AiService(RestTemplate restTemplate) {                                                                                    
            this.restTemplate = restTemplate;       
        }
        public String generateResponse(String userPrompt ) {
          Map<String, Object> part = new HashMap<>();
          part.put("text", userPrompt);
          
          List<Map<String, Object>> parts = new ArrayList<>();
          parts.add(part);
        
          Map<String, Object> content = new HashMap<>();
          content.put("parts", parts);

          List<Map<String, Object>> contents =  new ArrayList<>();
          contents.add(content);

          Map<String, Object> payload = new HashMap<>();
          payload.put("contents", contents);
        

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;  

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        return restTemplate.postForObject(url, entity, String.class);
        }
}
