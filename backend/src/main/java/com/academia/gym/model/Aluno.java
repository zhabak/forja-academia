/**
 * FORJA ACADEMIA — Aluno
 * Entidade JPA: representa uma tabela e seus relacionamentos no banco.
 */
package com.academia.gym.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name="alunos")
public class Aluno {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false) private String nome;
    @Column(nullable=false, unique=true) private String cpf;
    private LocalDate dataNascimento;
    private String telefone;
    private String email;
    @Column(nullable=false) private String status = "ATIVO";
    @Column(unique=true) private String identificadorBiometrico;
    @Column(nullable=false) private LocalDate dataCadastro = LocalDate.now();

    // Credenciais nunca são serializadas nas respostas JSON.
    @com.fasterxml.jackson.annotation.JsonIgnore private String senhaHash;
    @com.fasterxml.jackson.annotation.JsonIgnore private String ativacaoHash;
    @com.fasterxml.jackson.annotation.JsonIgnore private java.time.Instant ativacaoExpira;
    @com.fasterxml.jackson.annotation.JsonIgnore private String sessaoHash;
    @com.fasterxml.jackson.annotation.JsonIgnore private java.time.Instant sessaoExpira;
    public String getSenhaHash(){return senhaHash;} public void setSenhaHash(String v){senhaHash=v;}
    public String getAtivacaoHash(){return ativacaoHash;} public void setAtivacaoHash(String v){ativacaoHash=v;}
    public java.time.Instant getAtivacaoExpira(){return ativacaoExpira;} public void setAtivacaoExpira(java.time.Instant v){ativacaoExpira=v;}
    public String getSessaoHash(){return sessaoHash;} public void setSessaoHash(String v){sessaoHash=v;}
    public java.time.Instant getSessaoExpira(){return sessaoExpira;} public void setSessaoExpira(java.time.Instant v){sessaoExpira=v;}

    @com.fasterxml.jackson.annotation.JsonIgnore private java.time.Instant ativacaoUsadaEm;
    public java.time.Instant getAtivacaoUsadaEm(){return ativacaoUsadaEm;} public void setAtivacaoUsadaEm(java.time.Instant v){ativacaoUsadaEm=v;}

    // Métodos de acesso usados pela JPA, serialização JSON e regras de negócio.
    public Long getId(){return id;}
    public String getNome(){return nome;} public void setNome(String v){nome=v;}
    public String getCpf(){return cpf;} public void setCpf(String v){cpf=v;}
    public LocalDate getDataNascimento(){return dataNascimento;} public void setDataNascimento(LocalDate v){dataNascimento=v;}
    public String getTelefone(){return telefone;} public void setTelefone(String v){telefone=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public String getIdentificadorBiometrico(){return identificadorBiometrico;} public void setIdentificadorBiometrico(String v){identificadorBiometrico=v;}
    public LocalDate getDataCadastro(){return dataCadastro;}
}
