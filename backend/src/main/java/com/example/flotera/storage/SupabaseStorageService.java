package com.example.flotera.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "supabase")
public class SupabaseStorageService implements StorageService {

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucketName;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.key:}") String supabaseKey,
            @Value("${supabase.bucket:flotera}") String bucketName,
            RestTemplate restTemplate) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.bucketName = bucketName;
        this.restTemplate = restTemplate;
    }

    @Override
    public void init() {
        // Nu avem ce inițializa local pentru Supabase
    }

    @Override
    public String store(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new RuntimeException("Fișierul este gol.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + extension;
            String filePath = folder + "/" + filename;

            // URL pentru upload: https://[project].supabase.co/storage/v1/object/[bucket]/[path]
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, filePath);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);
            headers.setContentType(MediaType.valueOf(file.getContentType()));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // URL public: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
                return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, filePath);
            } else {
                throw new RuntimeException("Eroare la upload in Supabase: " + response.getBody());
            }
        } catch (Exception e) {
            throw new RuntimeException("Nu s-a putut salva fișierul în Supabase.", e);
        }
    }

    @Override
    public Path load(String filename) {
        // Nu este suportat pentru Supabase via Path (se folosesc URL-uri directe)
        return null;
    }

    @Override
    public void deleteAll() {
        // Implementare opțională
    }
}
