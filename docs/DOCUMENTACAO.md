# Documentação do Projeto — Sistema de Gestão de Academia

## 1. Identificação do problema
O sistema centraliza cadastro de alunos e colaboradores, planos, pagamentos e frequência, reduzindo erros de controles manuais e permitindo verificar automaticamente a situação do aluno no acesso.

## 2. Estudo de viabilidade
### Técnica
Java 17, Spring Boot, MySQL e HTML/CSS/JavaScript. São tecnologias amplamente utilizadas e adequadas a uma aplicação web acadêmica.

### Econômica
A solução utiliza ferramentas gratuitas/open source, reduzindo custos de desenvolvimento. O ambiente de demonstração pode ser executado em computador comum.

### Operacional
A interface possui dashboard, cadastro, consulta e controle de acesso. O treinamento esperado é básico.

### Segurança
O projeto prevê autenticação, permissões, proteção de credenciais e restrição de acesso aos dados. O identificador biométrico é apenas simulado no escopo acadêmico.

## 3. Atores
- Administrador: gerencia usuários, alunos, planos e relatórios.
- Recepcionista: cadastra alunos, registra pagamentos e consulta situação.
- Colaborador: utiliza funcionalidades autorizadas.
- Controle de acesso: recebe identificador biométrico e aplica as regras de entrada.

## 4. Requisitos funcionais
RF01 cadastrar alunos.
RF02 cadastrar colaboradores.
RF03 gerenciar planos.
RF04 controlar pagamentos.
RF05 identificar inadimplentes/pagamentos vencidos.
RF06 controlar frequência.
RF07 disponibilizar planos mensal, trimestral, semestral e anual.
RF08 bloquear acesso de aluno com plano vencido.
RF09 manter ID único.
RF10 permitir cancelamento sem apagar histórico.
RF11 receber biometria simulada.
RF12 verificar existência e status do aluno.
RF13 autenticar usuários.
RF14 controlar permissões.
RF15 gerar relatórios.

## 5. Requisitos não funcionais
- Usabilidade
- Segurança
- Integridade
- Persistência
- Manutenibilidade
- Desempenho adequado

## 6. Regras de negócio
1. CPF não pode ser duplicado.
2. ID do aluno é único.
3. Aluno cancelado não entra.
4. Plano vencido bloqueia acesso.
5. Histórico de frequência não é apagado no cancelamento.
6. Biometria inexistente bloqueia acesso.
7. Apenas usuário autorizado acessa funcionalidades administrativas.

## 7. Diagrama de casos de uso — representação textual
```text
Administrador -> Login
Administrador -> Gerenciar alunos
Administrador -> Gerenciar colaboradores
Administrador -> Gerenciar planos
Administrador -> Consultar pagamentos
Administrador -> Relatórios

Recepcionista -> Login
Recepcionista -> Cadastrar aluno
Recepcionista -> Registrar pagamento
Recepcionista -> Consultar inadimplentes
Recepcionista -> Consultar frequência

Controle de acesso -> Receber biometria
Controle de acesso -> Verificar aluno
Controle de acesso -> Verificar plano
Controle de acesso -> Autorizar/Bloquear entrada
Controle de acesso -> Registrar frequência
```

## 8. Diagrama de classes — representação textual
```text
Usuario 1 --- 1 Colaborador
Aluno 1 ----- * Matricula
Plano 1 ----- * Matricula
Matricula 1 - * Pagamento
Aluno 1 ----- * Frequencia
```

## 9. Protótipos
As telas implementadas são:
- Login
- Dashboard
- Cadastro/listagem de alunos
- Planos
- Controle de acesso

## 10. Testes
| ID | Teste | Resultado esperado |
|---|---|---|
| CT01 | Cadastro válido | Cadastro realizado |
| CT02 | CPF duplicado | Operação rejeitada |
| CT03 | Nome vazio | Operação rejeitada |
| CT04 | Login inválido | Acesso negado |
| CT05 | Biometria inexistente | Entrada bloqueada |
| CT06 | Aluno cancelado | Entrada bloqueada |
| CT07 | Plano vencido | Entrada bloqueada |
| CT08 | Aluno válido | Entrada autorizada |
| CT09 | Cancelamento | Histórico permanece |
