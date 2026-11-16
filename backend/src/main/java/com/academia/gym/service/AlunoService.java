/**
 * FORJA ACADEMIA — AlunoService
 * Valida cadastro e separa atualização de dados, status e vínculo facial.
 */
package com.academia.gym.service;

import com.academia.gym.model.Aluno;
import com.academia.gym.repository.AlunoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlunoService {

    private final AlunoRepository repo;

    public AlunoService(AlunoRepository repo) {
        this.repo = repo;
    }

    public List<Aluno> listar() {
        return repo.findAll();
    }

    public Aluno salvar(Aluno aluno) {

        if (aluno.getNome() == null || aluno.getNome().isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório.");
        }

        if (aluno.getCpf() == null || aluno.getCpf().isBlank()) {
            throw new IllegalArgumentException("CPF é obrigatório.");
        }

        if (repo.existsByCpf(aluno.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }

        if (aluno.getStatus() == null || aluno.getStatus().isBlank()) {
            aluno.setStatus("ATIVO");
        }

        return repo.save(aluno);
    }

    public Aluno atualizar(Long id, Aluno dados) {

        Aluno aluno = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Aluno não encontrado."));

        if (dados.getNome() != null && !dados.getNome().isBlank()) {
            aluno.setNome(dados.getNome());
        }

        if (dados.getCpf() != null && !dados.getCpf().isBlank()
                && !dados.getCpf().equals(aluno.getCpf())) {

            if (repo.existsByCpf(dados.getCpf())) {
                throw new IllegalArgumentException("CPF já cadastrado.");
            }

            aluno.setCpf(dados.getCpf());
        }

        if (dados.getEmail() != null) {
            aluno.setEmail(dados.getEmail());
        }

        if (dados.getTelefone() != null) {
            aluno.setTelefone(dados.getTelefone());
        }

        // Status e vínculo facial só mudam nas operações específicas.
        if (dados.getDataNascimento() != null) {
            aluno.setDataNascimento(dados.getDataNascimento());
        }

        return repo.save(aluno);
    }

    public Aluno cancelar(Long id) {

        Aluno aluno = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Aluno não encontrado."));

        aluno.setStatus("CANCELADO");

        return repo.save(aluno);
    }

    public Aluno reativar(Long id) {

        Aluno aluno = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Aluno não encontrado."));

        aluno.setStatus("ATIVO");

        return repo.save(aluno);
    }

    public Aluno vincularBiometriaFacial(Long id) {

        Aluno aluno = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Aluno não encontrado."));

        if (!"ATIVO".equals(aluno.getStatus())) {
            throw new IllegalArgumentException(
                    "Somente alunos ativos podem cadastrar o rosto."
            );
        }

        aluno.setIdentificadorBiometrico(
                "FACE:" + aluno.getId()
        );

        return repo.save(aluno);
    }
}