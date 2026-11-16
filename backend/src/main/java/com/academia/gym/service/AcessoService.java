/**
 * FORJA ACADEMIA — AcessoService
 * Decide a autorização e registra frequência somente para alunos identificados.
 */
package com.academia.gym.service;

import com.academia.gym.model.*;
import com.academia.gym.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Service
public class AcessoService {
    private final AlunoRepository alunos;
    private final MatriculaRepository matriculas;
    private final FrequenciaRepository frequencias;

    public AcessoService(AlunoRepository a, MatriculaRepository m, FrequenciaRepository f){
        alunos=a; matriculas=m; frequencias=f;
    }

    public Map<String,Object> verificar(String biometria){
        Optional<Aluno> opt=biometria == null || biometria.isBlank()
            ? Optional.empty() : alunos.findByIdentificadorBiometrico(biometria);
        Frequencia f=new Frequencia();
        f.setDataHora(LocalDateTime.now());

        if(opt.isEmpty()){
            // Frequência exige aluno; tentativas desconhecidas não criam registros inválidos.
            return Map.of("autorizado",false,"motivo","Aluno não encontrado");
        }
        Aluno a=opt.get(); f.setAluno(a);
        if(!"ATIVO".equals(a.getStatus())){
            f.setAcessoAutorizado(false); f.setMotivo("Aluno inativo/cancelado");
            frequencias.save(f);
            return Map.of("autorizado",false,"motivo","Aluno inativo/cancelado","aluno",a.getNome());
        }
        boolean vigente=matriculas.findByAlunoId(a.getId()).stream()
            .anyMatch(m -> m.vigenteEm(LocalDate.now()));
        if(!vigente){
            f.setAcessoAutorizado(false); f.setMotivo("Sem matrícula vigente: plano vencido, futuro, inativo ou inexistente");
            frequencias.save(f);
            return Map.of("autorizado",false,"motivo","Sem matrícula vigente: plano vencido, futuro, inativo ou inexistente","aluno",a.getNome());
        }
        f.setAcessoAutorizado(true); f.setMotivo("Acesso autorizado");
        frequencias.save(f);
        return Map.of("autorizado",true,"motivo","Acesso autorizado","aluno",a.getNome());
    }
}
