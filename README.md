# Forja Academia

Projeto acadêmico de gestão de academia com painel administrativo e aplicativo mobile do aluno.

## O que o projeto demonstra

- Cadastro, edição, cancelamento, reativação e exclusão de alunos.
- Planos e matrículas, com bloqueio de acesso para plano vencido ou cadastro inativo.
- Controle de acesso facial demonstrativo: o descritor e a foto ficam no navegador; o backend valida o vínculo do aluno e sua matrícula.
- Primeiro acesso do aluno por CPF, código temporário emitido pela recepção e criação de senha.
- Aplicativo mobile do aluno: fichas A/B/C, cronômetro de treino, pausa por série configurável, agenda de aulas, reservas e pagamentos demonstrativos.

## Estrutura

```text
backend/     API Java 17 + Spring Boot + JPA
frontend/    Gestão da academia e aplicativo mobile do aluno
database/    Estrutura inicial do MySQL
docs/        Documentação e guia didático do código
```

## Executar localmente

1. Instale Java 17 ou superior, Maven, MySQL 8 e Python 3.
2. Crie o banco e execute `database/schema.sql`.
3. Na pasta `backend/src/main/resources`, copie `application-local.example.properties` para `application-local.properties` e informe a senha local do MySQL. Esse arquivo não vai para o GitHub.
4. Na pasta `backend`, execute:

   ```powershell
   mvn clean spring-boot:run
   ```

5. Em outro terminal, dentro da pasta `frontend`, execute:

   ```powershell
   python -m http.server 5500
   ```

6. Abra:

   - Gestão: `http://localhost:5500`
   - Aplicativo do aluno: `http://localhost:5500/aluno.html`

## Credenciais de demonstração

- Gestão: usuário `admin`; senha definida pela variável `FORJA_ADMIN_SENHA` ou `admin123` se ela não estiver configurada.
- Aluno: a recepção gera um código de uso único na tela do aluno; o aluno utiliza o CPF cadastrado, o código e uma senha no primeiro acesso.

## Roteiro curto de apresentação

1. Cadastre um aluno e associe um plano.
2. Gere o código de primeiro acesso na gestão.
3. No aplicativo do aluno, informe o CPF e crie uma senha com o código.
4. Mostre as fichas A/B/C, as séries, o descanso configurável e o cronômetro.
5. Reserve uma aula e mostre o plano/pagamento simulado.
6. Altere o vencimento ou cancele o aluno na gestão e atualize o aplicativo: treino e reservas serão bloqueados.

## Para avaliação do código

Leia [GUIA_GITHUB_E_CODIGO.md](docs/GUIA_GITHUB_E_CODIGO.md). Ele explica a organização e o caminho de uma ação da interface até o banco de dados.

## Limites do protótipo

Este sistema foi feito para demonstração acadêmica local. Pagamentos e reservas são simulados; dados faciais e histórico de treinos do aplicativo ficam no navegador. Não publique credenciais reais, banco de dados, fotos ou descritores faciais.
