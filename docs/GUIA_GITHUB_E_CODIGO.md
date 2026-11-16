# Guia para apresentar o código — Forja Academia

Este documento explica como o projeto está organizado e onde localizar cada regra durante a apresentação.

## Visão geral

```text
Tela HTML → JavaScript → API REST → Controller → Service/Repository → MySQL
```

O frontend envia uma ação por `fetch`. O controller recebe a rota HTTP. Quando existe uma regra de negócio, o controller encaminha para um service. O repository grava ou consulta as entidades no MySQL.

## Organização de pastas

| Caminho | Responsabilidade |
| --- | --- |
| `frontend/index.html` | Área de gestão da academia. |
| `frontend/app.js` | Eventos, formulários, tabelas e chamadas da gestão. |
| `frontend/style.css` | Identidade visual e responsividade da gestão. |
| `frontend/aluno.html` | Estrutura do aplicativo do aluno. |
| `frontend/aluno.js` | Login do aluno, treinos, pausas por série, agenda e simulações locais. |
| `frontend/aluno.css` | Interface mobile do aplicativo do aluno. |
| `backend/.../model` | Entidades que representam as tabelas do banco. |
| `backend/.../repository` | Consultas e persistência com Spring Data JPA. |
| `backend/.../service` | Regras de negócio: aluno, acesso, exclusão e credenciais. |
| `backend/.../controller` | Rotas da API REST consumidas pelo frontend. |
| `database/schema.sql` | Criação inicial das tabelas e planos. |

## Comentários no código

Os arquivos têm comentários de cabeçalho, blocos e funções. Eles explicam a intenção da parte do código, sem repetir literalmente o que cada linha já mostra.

No JavaScript do aluno, os blocos principais são:

1. **Dados e estado:** fichas A/B/C, aulas, plano e armazenamento local.
2. **Integração:** `consultar()` centraliza as chamadas seguras ao backend.
3. **Regra de plano:** `vigente()`, `contrato()` e `podeTreinar()` bloqueiam treinos quando necessário.
4. **Treino:** cada série é concluída individualmente e abre a pausa configurável.
5. **Agenda:** reservas são demonstrativas e salvas apenas naquele navegador.
6. **Autenticação:** CPF identifica a etapa; senha e código de ativação são validados pelo backend.

## Funcionalidades demonstráveis

- Cadastro, edição, cancelamento e exclusão de alunos.
- Matrículas e planos, incluindo vencimento.
- Reconhecimento facial demonstrativo e controle de acesso.
- Primeiro acesso do aluno via CPF, código temporário da recepção e senha.
- Aplicativo do aluno com plano, pagamentos simulados, treinos A/B/C, séries e descanso configurável.
- Aulas e reservas simuladas.

## Limites acadêmicos declarados

- Login administrativo e do aluno foram feitos para demonstração local; antes de produção seria necessário HTTPS, banco configurado por variáveis de ambiente e autenticação persistente.
- Foto/descritor facial e treinos/agendamentos demonstrativos ficam no navegador, não são sincronizados entre dispositivos.
- Pagamento e reserva não realizam cobrança ou reserva real de vaga.

## Publicação no GitHub

O arquivo `.gitignore` impede que o repositório receba compilados, logs e arquivos locais. Antes de publicar, revise `application.properties`: não publique credenciais reais do banco.

Na apresentação, mostre primeiro este arquivo, depois siga o caminho `HTML → JavaScript → Controller → Service → Repository` usando um fluxo como “Cadastrar aluno com plano”.
