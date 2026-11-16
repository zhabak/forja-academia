package com.academia.gym.controller;

import com.academia.gym.service.ExclusaoAlunoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

/** Rota separada para exclusão permanente; cancelar continua preservando histórico. */
@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*")
public class ExclusaoAlunoController {
    private final ExclusaoAlunoService service;
    public ExclusaoAlunoController(ExclusaoAlunoService service) { this.service = service; }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
