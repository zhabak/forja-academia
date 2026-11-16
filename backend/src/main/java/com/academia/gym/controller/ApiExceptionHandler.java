/**
 * FORJA ACADEMIA — ApiExceptionHandler
 * Converte IllegalArgumentException em resposta HTTP 400 com mensagem legível.
 */
package com.academia.gym.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String,String> invalid(IllegalArgumentException e) {
        return Map.of("message", e.getMessage());
    }
}
