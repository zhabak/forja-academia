/**
 * FORJA ACADEMIA — AcessoController
 * Recebe requisições HTTP, converte os dados e encaminha a operação.
 */
package com.academia.gym.controller;

import com.academia.gym.service.AcessoService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/acesso")
@CrossOrigin(origins="*")
public class AcessoController {
    private final AcessoService service;
    public AcessoController(AcessoService s){service=s;}
    // POST: recebe dados para criação ou processamento da operação.
    @PostMapping("/verificar")
    public Map<String,Object> verificar(@RequestBody Map<String,String> body){
        return service.verificar(body.get("biometria"));
    }
}
