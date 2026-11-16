/**
 * FORJA ACADEMIA — AlunoController
 * Recebe requisições HTTP, converte os dados e encaminha a operação.
 */
package com.academia.gym.controller;

import com.academia.gym.model.Aluno;
import com.academia.gym.service.AlunoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*")
public class AlunoController {

    private final AlunoService service;

    public AlunoController(AlunoService service) {
        this.service = service;
    }

    // GET: consulta dados sem alterá-los.
    @GetMapping
    public List<Aluno> listar() {
        return service.listar();
    }

    // POST: recebe dados para criação ou processamento da operação.
    @PostMapping
    public Aluno salvar(@RequestBody Aluno aluno) {
        return service.salvar(aluno);
    }

    // PUT: atualiza o recurso indicado no caminho da requisição.
    @PutMapping("/{id}")
    public Aluno atualizar(
            @PathVariable Long id,
            @RequestBody Aluno aluno) {
        return service.atualizar(id, aluno);
    }

    // PUT: atualiza o recurso indicado no caminho da requisição.
    @PutMapping("/{id}/cancelar")
    public Aluno cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }

    // PUT: atualiza o recurso indicado no caminho da requisição.
    @PutMapping("/{id}/reativar")
    public Aluno reativar(@PathVariable Long id) {
        return service.reativar(id);
    }

    // PUT: atualiza o recurso indicado no caminho da requisição.
    @PutMapping("/{id}/biometria-facial")
    public Aluno vincularBiometriaFacial(@PathVariable Long id) {
        return service.vincularBiometriaFacial(id);
    }
}
