    package com.example.flotera.notification;                                                                                               
                                                                                                                                            
    import org.springframework.stereotype.Service;                                                                                          
    import org.springframework.web.client.RestTemplate;                                                                                     
    import java.util.Map;                                                                                                                   
    import java.util.HashMap;                                                                                                               
    import org.springframework.http.HttpEntity;                                                                                             
    import org.springframework.http.HttpHeaders;                                                                                            
    import org.springframework.http.MediaType;                                                                                              
    import org.springframework.beans.factory.annotation.Value;                                                                              
    import org.springframework.scheduling.annotation.Async;                                                                                 
                                                                                                                                            
    @Service                                                                                                                                
    public class EmailService {                                                                                                             
        private final RestTemplate restTemplate;                                                                                            
                                                                                                                                            
        @Value("${resend.key}")                                                                                                             
        private String apiKey;                                                                                                              
                                                                                                                                            
        public EmailService(RestTemplate restTemplate) {                                                                                    
            this.restTemplate = restTemplate;                                                                                               
        }                                                                                                                                   
                                                                                                                                            
        @Async                                                                                                                              
        public void sendEmail(String to, String subject, String html) {                                                                     
            Map<String, Object> payload = new HashMap<>();                                                                                  
            payload.put("from", "onboarding@resend.dev");                                                                                   
            payload.put("to", to);                                                                                                          
            payload.put("subject", subject);                                                                                                
            // Înlocuim liniile noi cu tag-uri HTML <br> pentru formatare corectă în inbox                                                  
            payload.put("html", html.replace("\n", "<br>"));                                                                                
                                                                                                                                            
            HttpHeaders headers = new HttpHeaders();                                                                                        
            headers.setContentType(MediaType.APPLICATION_JSON);                                                                             
            headers.set("Authorization", "Bearer " + apiKey);                                                                               
                                                                                                                                            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);                                                    
                                                                                                                                            
            String url = "https://api.resend.com/emails";                                                                                   
            try {                                                                                                                           
                restTemplate.postForEntity(url, entity, String.class);                                                                      
            } catch (Exception e) {                                                                                                         
                // Logăm eroarea în consolă în caz de eșec pentru a fi mai ușor de investigat                                               
                System.err.println("Eroare trimitere mail Resend API: " + e.getMessage());                                                  
            }                                                                                                                               
        }                                                                                                                                   
    }  