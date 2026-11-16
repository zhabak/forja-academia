/**
 * FORJA ACADEMIA — Frequencia
 * Histórico de tentativas conhecidas, com aluno, horário, decisão e motivo.
 */
package com.academia.gym.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="frequencias")
public class Frequencia {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Aluno aluno;
    private LocalDateTime dataHora;
    private boolean acessoAutorizado;
    private String motivo;

    // Métodos de acesso usados pela JPA, serialização JSON e regras de negócio.
    public Long getId(){return id;}
    public Aluno getAluno(){return aluno;} public void setAluno(Aluno v){aluno=v;}
    public LocalDateTime getDataHora(){return dataHora;} public void setDataHora(LocalDateTime v){dataHora=v;}
    public boolean isAcessoAutorizado(){return acessoAutorizado;} public void setAcessoAutorizado(boolean v){acessoAutorizado=v;}
    public String getMotivo(){return motivo;} public void setMotivo(String v){motivo=v;}
}
