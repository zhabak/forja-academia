/**
 * FORJA ACADEMIA — Pagamento
 * Estrutura de pagamentos; não existe fluxo completo de cobrança/baixa nesta interface.
 */
package com.academia.gym.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name="pagamentos")
public class Pagamento {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Matricula matricula;
    private BigDecimal valor;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;
    private String status = "PENDENTE";

    // Métodos de acesso usados pela JPA, serialização JSON e regras de negócio.
    public Long getId(){return id;}
    public Matricula getMatricula(){return matricula;} public void setMatricula(Matricula v){matricula=v;}
    public BigDecimal getValor(){return valor;} public void setValor(BigDecimal v){valor=v;}
    public LocalDate getDataVencimento(){return dataVencimento;} public void setDataVencimento(LocalDate v){dataVencimento=v;}
    public LocalDate getDataPagamento(){return dataPagamento;} public void setDataPagamento(LocalDate v){dataPagamento=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
}
