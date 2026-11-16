# Forja Academia — guia do código para apresentação

## 1. Como o projeto está organizado

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| frontend/index.html | Estrutura das telas, campos, tabelas e botões. |
| frontend/style.css | Cores, tamanhos, espaçamentos e adaptação para celular. |
| frontend/app.js | Eventos dos botões, chamadas HTTP, regras de exibição e reconhecimento facial. |
| frontend/assets/forja-logo.png | Logo fornecida para a identidade visual. |
| backend/src/main/java/com/academia/gym/GymApplication.java | Inicia o servidor Spring Boot. |
| backend/.../controller | Recebe requisições e expõe as rotas da API. |
| backend/.../service | Aplica as regras de negócio de alunos e acesso. |
| backend/.../model | Representa as tabelas com entidades JPA. |
| backend/.../repository | Consulta e grava as entidades no MySQL usando Spring Data JPA. |
| backend/src/main/resources/application.properties | Configuração do banco e da porta do servidor. |
| database/schema.sql | Estrutura inicial do MySQL e planos iniciais. |
| backend/src/test/java/com/academia/gym/PresentationTest.java | Testes das regras com repositórios simulados. |
| frontend/tests/presentation.cjs | Verificações do JavaScript com tela e HTTP simulados. |

Os arquivos fontes contêm comentários em português. No CSS, os blocos estão numerados; no JavaScript, cada função tem uma descrição; no HTML, os comentários indicam as áreas e sua ligação com o JavaScript.

## 2. Caminho de uma operação

Botão no HTML → função em app.js → chamada HTTP pela função api() → controller Java → serviço/repositório → MySQL → resposta JSON → atualização da tela.

Os controllers de plano e matrícula usam os repositórios diretamente. Alunos e acesso possuem uma camada de serviço própria. Não há MatriculaService nesta versão.

Exemplo de cadastro:
1. O botão Salvar chama salvarAlunoComPlano().
2. O frontend valida os campos básicos e envia POST /api/alunos.
3. AlunoController chama AlunoService, que valida nome e CPF duplicado.
4. AlunoRepository grava o aluno e devolve seu ID.
5. O frontend envia POST /api/matriculas com alunoId e planoId.
6. MatriculaController calcula/valida as datas e salva o vínculo.
7. loadAlunos() consulta alunos e matrículas; renderAlunos() atualiza as oito colunas.

As duas gravações são requisições separadas, não uma transação única. Se a matrícula falhar após criar o aluno, o formulário mantém o ID para evitar duplicação e permite concluir pelo botão Plano.

## 3. Funções importantes do JavaScript

| Grupo | Funções | O que explicar |
| --- | --- | --- |
| Comunicação | api | Padroniza envio/recebimento JSON e erros HTTP. |
| Navegação | login, logout, show, loadAll | Controla a sessão demonstrativa e as telas. |
| Alunos | salvarAlunoComPlano, loadAlunos, renderAlunos, editarAluno | Cadastro, tabela e edição de dados. |
| Planos | loadPlanos | Preenche o catálogo e os seletores. |
| Matrícula | abrirEdicaoPlano, salvarPlanoAluno | PUT altera o vínculo existente; POST cria somente quando não há vínculo. |
| Demonstração | simularPlanoVencido, mudarStatus | Grava vencimento, cancelamento e reativação. |
| Facial | prepararModelos, cameraPronta, cadastrarRosto, autenticarRosto | Prepara câmera/modelos, cadastra descritor e verifica acesso. |
| Apresentação | formatarCpf, formatarTelefone, aplicarMascara | Formata a digitação; não comprova a validade do CPF nem do telefone. |

## 4. Regra de acesso

AcessoService procura o aluno pelo identificador biométrico. Se não encontrar, retorna negativa sem salvar frequência inválida. Se encontrar, exige aluno ATIVO e ao menos uma matrícula ATIVA com início e fim preenchidos, início <= hoje <= fim e plano ativo. A tentativa conhecida é registrada em frequencias, autorizada ou negada.

Cancelar o aluno altera seu status, sem excluir frequência ou rosto. Reativar não renova datas. Uma atualização comum dos dados não muda status ou vínculo facial.

## 5. Onde fica o rosto

O descritor numérico fica no localStorage do navegador, na chave gym_face_<id>. O banco guarda o identificador FACE:<id>. O cadastro cria o vínculo; a autenticação reutiliza esse vínculo e chama POST /api/acesso/verificar. Por isso, trocar navegador/origem não transfere os descritores faciais.

## 6. Roteiro de explicação à professora

1. Mostre index.html e a ligação onclick → função no app.js.
2. Mostre api() e a rota correspondente no controller.
3. Explique a diferença entre entidade, repositório e serviço.
4. Demonstre cadastro, edição de matrícula com PUT e os quatro cenários de acesso.
5. Mostre AcessoService e vigenteEm() em Matricula como regras centrais.
6. Mostre os testes e explique que usam dados simulados, sem depender do banco real.

## 7. Limites que devem ser apresentados corretamente

Login demonstrativo, sem proteção de autenticação no backend. Facial acadêmico executado no navegador. Colaboradores e cobrança completa não estão implementados. O contador de pagamentos vencidos consulta o status já gravado; não calcula automaticamente o atraso. Os comentários explicam o comportamento atual, não funcionalidades futuras.
