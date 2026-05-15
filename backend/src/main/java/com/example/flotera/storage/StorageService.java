package com.example.flotera.storage;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {
    void init();
    /**
     * Salvează fișierul și returnează URL-ul complet (sau calea) care va fi salvată în baza de date.
     */
    String store(MultipartFile file, String folder);
    Path load(String filename);
    void deleteAll();
}
