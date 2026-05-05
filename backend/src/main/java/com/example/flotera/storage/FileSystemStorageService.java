package com.example.flotera.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    public FileSystemStorageService(@Value("${storage.location:uploads}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation);
    }

    @Override
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Nu s-a putut inițializa folderul de stocare", e);
        }
    }

    @Override
    public String store(MultipartFile file, String folder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Fișierul este gol.");
            }

            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = filename.substring(filename.lastIndexOf("."));
            String storedFilename = UUID.randomUUID().toString() + extension;

            Path destinationFolder = this.rootLocation.resolve(folder);
            if (!Files.exists(destinationFolder)) {
                Files.createDirectories(destinationFolder);
            }

            Path destinationFile = destinationFolder.resolve(Paths.get(storedFilename))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(destinationFolder.toAbsolutePath())) {
                // Securitate: verificăm să nu se încerce scrierea în afara folderului root
                throw new RuntimeException("Nu se poate stoca fișierul în afara directorului curent.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return folder + "/" + storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Eroare la salvarea fișierului.", e);
        }
    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public void deleteAll() {
        // Implementare opțională pentru curățenie în teste
    }
}
