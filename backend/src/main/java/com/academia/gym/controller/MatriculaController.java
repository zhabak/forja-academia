/**
 * FORJA ACADEMIA — MatriculaController
 * Lista, cria e atualiza matrículas, validando datas e status.
 */
package com.academia.gym.controller;

import com.academia.gym.model.Matricula;
import com.academia.gym.repository.MatriculaRepository;
import com.academia.gym.repository.AlunoRepository;
import com.academia.gym.repository.PlanoRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
@CrossOrigin(origins = "*")
public class MatriculaController {

    private final MatriculaRepository matriculaRepository;
    private final AlunoRepository alunoRepository;
    private final PlanoRepository planoRepository;

    public MatriculaController(
            MatriculaRepository matriculaRepository,
            AlunoRepository alunoRepository,
            PlanoRepository planoRepository) {

        this.matriculaRepository = matriculaRepository;
        this.alunoRepository = alunoRepository;
        this.planoRepository = planoRepository;
    }

    // GET: consulta dados sem alterá-los.
    @GetMapping
    public List<Matricula> listar() {
        return matriculaRepository.findAll();
    }

    // POST: recebe dados para criação ou processamento da operação.
    @PostMapping
    public Matricula criar(@RequestBody MatriculaRequest request) {

        var aluno = alunoRepository.findById(request.alunoId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Aluno não encontrado."));

        var plano = planoRepository.findById(request.planoId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Plano não encontrado."));

        Matricula matricula = new Matricula();

        matricula.setAluno(aluno);
        matricula.setPlano(plano);

        LocalDate inicio = request.inicio() != null
                ? request.inicio()
                : LocalDate.now();

        matricula.setDataInicio(inicio);
        matricula.setDataFim(
                request.dataFim() != null ? request.dataFim() : inicio.plusMonths(plano.getDuracaoMeses())
        );

        matricula.setStatus(request.status() != null ? request.status() : "ATIVA");
        if (request.meioPagamento() != null) matricula.setMeioPagamento(request.meioPagamento().isBlank() ? null : request.meioPagamento());
        validar(matricula);
        return matriculaRepository.save(matricula);
    }

    // PUT: atualiza o recurso indicado no caminho da requisição.
    @PutMapping("/{id}")
    public Matricula atualizar(
            @PathVariable Long id,
            @RequestBody MatriculaRequest request) {

        Matricula matricula =
                matriculaRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Matrícula não encontrada."
                                ));

        var plano = planoRepository.findById(request.planoId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Plano não encontrado."));

        matricula.setPlano(plano);

        LocalDate inicio = request.inicio() != null
                ? request.inicio()
                : matricula.getDataInicio();

        matricula.setDataInicio(inicio);

        if (request.dataFim() != null) {
            matricula.setDataFim(request.dataFim());
        } else {
            matricula.setDataFim(
                    inicio.plusMonths(plano.getDuracaoMeses())
            );
        }

        matricula.setStatus(
                request.status() != null
                        ? request.status()
                        : matricula.getStatus()
        );

        if (request.meioPagamento() != null) matricula.setMeioPagamento(request.meioPagamento().isBlank() ? null : request.meioPagamento());
        validar(matricula);
        return matriculaRepository.save(matricula);
    }

    private void validar(Matricula m) {
        if (m.getMeioPagamento() != null && !java.util.Set.of("CARTAO", "PIX", "DINHEIRO").contains(m.getMeioPagamento()))
            throw new IllegalArgumentException("Meio de pagamento inválido: escolha Cartão, Pix ou Dinheiro.");
        if (m.getPlano().getDuracaoMeses() <= 0)
            throw new IllegalArgumentException("Duração do plano deve ser positiva.");
        if (m.getDataInicio() == null || m.getDataFim() == null || m.getDataFim().isBefore(m.getDataInicio()))
            throw new IllegalArgumentException("Vencimento deve ser igual ou posterior ao início.");
        if (!java.util.Set.of("ATIVA", "CANCELADA", "VENCIDA").contains(m.getStatus()))
            throw new IllegalArgumentException("Status de matrícula inválido.");
    }

    public record MatriculaRequest(
            Long alunoId,
            Long planoId,
            LocalDate inicio,
            LocalDate dataFim,
            String status,
            String meioPagamento
    ) {
        // Compatibilidade com chamadas anteriores que não informavam o meio de pagamento.
        public MatriculaRequest(Long alunoId, Long planoId, LocalDate inicio, LocalDate dataFim, String status) {
            this(alunoId, planoId, inicio, dataFim, status, null);
        }
    }
}