/**
 * FORJA ACADEMIA — PlanoController
 * Recebe requisições HTTP, converte os dados e encaminha a operação.
 */
package com.academia.gym.controller;

import com.academia.gym.model.Plano;
import com.academia.gym.repository.PlanoRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/planos")
@CrossOrigin(origins="*")
public class PlanoController {
    private final PlanoRepository repo;
    public PlanoController(PlanoRepository r){repo=r;}
    // GET: consulta dados sem alterá-los.
    @GetMapping public List<Plano> listar(){return repo.findAll();}
    // POST: recebe dados para criação ou processamento da operação.
    @PostMapping public Plano salvar(@RequestBody Plano p){return repo.save(p);}
}
