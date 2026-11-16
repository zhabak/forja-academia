# Autenticação facial — demonstração acadêmica

## Objetivo
Adicionar uma etapa visual de autenticação ao controle de acesso da academia: a webcam captura um rosto, o navegador gera um descritor facial e compara com os rostos previamente cadastrados.

## Fluxo
1. Operador seleciona um aluno ativo.
2. Webcam captura o rosto.
3. `face-api.js` detecta face, pontos faciais e gera o descritor.
4. O descritor é associado localmente ao ID do aluno.
5. No acesso, um novo descritor é comparado com os cadastrados.
6. O aluno identificado é enviado ao backend através do identificador `FACE:<id>`.
7. O backend aplica as regras do projeto: aluno precisa existir, estar ativo e possuir matrícula válida.
8. O resultado é registrado na tabela de frequências.

## Relação com o enunciado
O enunciado do Grupo 2 determina que o sistema receba um identificador biométrico simulado e verifique se o aluno está autorizado a entrar, considerando regras como existência e situação ativa. A implementação mantém essa regra no backend e usa o reconhecimento facial como forma de produzir/selecionar o identificador para a demonstração.

## Limitações
Esta implementação é propositalmente voltada à apresentação acadêmica. O descritor facial fica no armazenamento local do navegador; ele não é enviado ao servidor. Não há detecção de vida (liveness), criptografia de template biométrico, gestão de consentimento, controle de acesso por perfil ou mecanismo antifraude. Essas medidas devem ser adicionadas antes de qualquer uso real.
