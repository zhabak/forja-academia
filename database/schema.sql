-- FORJA ACADEMIA: criação inicial do banco, tabelas e planos.
-- Confira dados existentes antes de executar em uma base já utilizada.
CREATE DATABASE IF NOT EXISTS academia;
USE academia;

-- Tabela alunos: estrutura persistida no MySQL.
CREATE TABLE IF NOT EXISTS alunos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(30),
    email VARCHAR(120),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    identificador_biometrico VARCHAR(100) UNIQUE,
    data_cadastro DATE NOT NULL
);

-- Tabela colaboradores: estrutura persistida no MySQL.
CREATE TABLE IF NOT EXISTS colaboradores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(120),
    telefone VARCHAR(30),
    cargo VARCHAR(80) NOT NULL,
    usuario VARCHAR(60) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL DEFAULT 'RECEPCIONISTA',
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela planos: estrutura persistida no MySQL.
CREATE TABLE IF NOT EXISTS planos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    modalidade VARCHAR(20) NOT NULL,
    duracao_meses INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela matriculas: estrutura persistida no MySQL.
CREATE TABLE IF NOT EXISTS matriculas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meio_pagamento VARCHAR(16),
    aluno_id BIGINT NOT NULL,
    plano_id BIGINT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    CONSTRAINT fk_matricula_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    CONSTRAINT fk_matricula_plano FOREIGN KEY (plano_id) REFERENCES planos(id)
);

-- Tabela pagamentos: estrutura persistida no MySQL.
CREATE TABLE IF NOT EXISTS pagamentos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    matricula_id BIGINT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    CONSTRAINT fk_pagamento_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas(id)
);

-- Tabela frequencias: estrutura persistida no MySQL.
CREATE TABLE IF NOT EXISTS frequencias (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aluno_id BIGINT NOT NULL,
    data_hora DATETIME NOT NULL,
    acesso_autorizado BOOLEAN NOT NULL,
    motivo VARCHAR(120),
    CONSTRAINT fk_frequencia_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

INSERT INTO planos (nome, modalidade, duracao_meses, valor)
SELECT 'Plano Mensal', 'MENSAL', 1, 99.90
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE modalidade = 'MENSAL');

INSERT INTO planos (nome, modalidade, duracao_meses, valor)
SELECT 'Plano Trimestral', 'TRIMESTRAL', 3, 279.90
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE modalidade = 'TRIMESTRAL');

INSERT INTO planos (nome, modalidade, duracao_meses, valor)
SELECT 'Plano Semestral', 'SEMESTRAL', 6, 499.90
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE modalidade = 'SEMESTRAL');

INSERT INTO planos (nome, modalidade, duracao_meses, valor)
SELECT 'Plano Anual', 'ANUAL', 12, 899.90
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE modalidade = 'ANUAL');
