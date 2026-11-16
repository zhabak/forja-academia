/**
 * FORJA ACADEMIA — Plano
 * Entidade JPA: representa uma tabela e seus relacionamentos no banco.
 */
package com.academia.gym.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name="planos")
public class Plano {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String nome;
    @Column(nullable=false) private String modalidade;
    @Column(nullable=false) private int duracaoMeses;
    @Column(nullable=false) private BigDecimal valor;
    private boolean ativo = true;

    // Métodos de acesso usados pela JPA, serialização JSON e regras de negócio.
    public Long getId(){return id;}
    public String getNome(){return nome;} public void setNome(String v){nome=v;}
    public String getModalidade(){return modalidade;} public void setModalidade(String v){modalidade=v;}
    public int getDuracaoMeses(){return duracaoMeses;} public void setDuracaoMeses(int v){duracaoMeses=v;}
    public BigDecimal getValor(){return valor;} public void setValor(BigDecimal v){valor=v;}
    public boolean isAtivo(){return ativo;} public void setAtivo(boolean v){ativo=v;}
}
