/**
 * FORJA ACADEMIA — DashboardController
 * Calcula indicadores; pagamentos vencidos são os já marcados VENCIDO.
 */
package com.academia.gym.controller;

import com.academia.gym.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/dashboard")
@CrossOrigin(origins="*")
public class DashboardController {
    private final AlunoRepository alunos;
    private final FrequenciaRepository frequencias;
    private final PagamentoRepository pagamentos;
    public DashboardController(AlunoRepository a, FrequenciaRepository f, PagamentoRepository p){
        alunos=a; frequencias=f; pagamentos=p;
    }
    // GET: consulta dados sem alterá-los.
    @GetMapping
    public Map<String,Object> dados(){
        long ativos=alunos.findAll().stream().filter(a->"ATIVO".equals(a.getStatus())).count();
        long inad=pagamentos.findByStatus("VENCIDO").size();
        return Map.of("alunosAtivos",ativos,"pagamentosVencidos",inad,
                "entradasRegistradas",frequencias.countByAcessoAutorizadoTrue());
    }
}
