package com.example.flotera;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;
import java.time.Clock;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class FloteraApplication {

	public static void main(String[] args) {
		SpringApplication.run(FloteraApplication.class, args);
	}

	@Bean
	public Clock clock() {
		return Clock.systemDefaultZone();
	}

}
