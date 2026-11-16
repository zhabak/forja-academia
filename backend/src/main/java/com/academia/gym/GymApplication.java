/**
 * FORJA ACADEMIA — GymApplication
 * Ponto de entrada: inicia o Spring Boot e a descoberta dos componentes.
 */
package com.academia.gym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GymApplication {
    public static void main(String[] args) {
        SpringApplication.run(GymApplication.class, args);
    }
}
