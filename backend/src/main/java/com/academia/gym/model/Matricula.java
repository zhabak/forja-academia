/**
 * FORJA ACADEMIA — Matricula
 * Representa o vínculo aluno–plano e avalia vigência por status e datas.
 */
package com.academia.gym.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name="matriculas")
public class Matricula {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Aluno aluno;
    @ManyToOne(optional=false) private Plano plano;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String status = "ATIVA";

    // Métodos de acesso usados pela JPA, serialização JSON e regras de negócio.
    // Meio informado para o plano; null mantém matrículas antigas sem informação inventada.
    @Column(length=16) private String meioPagamento;
    public String getMeioPagamento(){return meioPagamento;}
    public void setMeioPagamento(String v){meioPagamento=v;}

    public Long getId(){return id;}
    public Aluno getAluno(){return aluno;} public void setAluno(Aluno v){aluno=v;}
    public Plano getPlano(){return plano;} public void setPlano(Plano v){plano=v;}
    public LocalDate getDataInicio(){return dataInicio;} public void setDataInicio(LocalDate v){dataInicio=v;}
    public LocalDate getDataFim(){return dataFim;} public void setDataFim(LocalDate v){dataFim=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public boolean vigenteEm(LocalDate hoje){
        return "ATIVA".equals(status) && dataInicio != null && dataFim != null
            && !dataInicio.isAfter(hoje) && !dataFim.isBefore(hoje)
            && plano != null && plano.isAtivo();
    }
    public boolean estaVencida(){return dataFim != null && dataFim.isBefore(LocalDate.now());}
}
