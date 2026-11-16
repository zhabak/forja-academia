# Forja — acesso individual do aluno

## Como usar após esta atualização
1. Pare o backend e execute `mvn clean spring-boot:run` na pasta backend. Com `ddl-auto=update`, o Hibernate acrescenta os campos privados de senha, ativação e sessão na tabela alunos; não é necessário apagar ou recriar os cadastros.
2. Atualize a gestão com Ctrl+F5 e entre novamente. Na demonstração, usuário admin e senha admin123; o servidor valida estas credenciais. Para outro ambiente, configure FORJA_ADMIN_SENHA antes de iniciar.
3. Na linha do aluno, clique Código de acesso. Confira a identidade e entregue o código de uso único (30 minutos). O mesmo fluxo recupera senha; emitir outro código invalida o anterior.
4. Em aluno.html, informe CPF e uma senha de 8 a 128 caracteres. Abra Primeiro acesso / esqueci minha senha, informe o código e confirme a senha. Clique Criar / redefinir senha.
5. Nos próximos acessos, use apenas CPF e senha. Não existe mais seletor público de alunos. CPF inexistente orienta procurar a recepção.

## Regras
- Senha: PBKDF2-HMAC-SHA256, sal aleatório, 600.000 iterações. Hashes e tokens não aparecem no JSON das entidades.
- Sessão do aluno: token aleatório, somente hash no banco, validade de 8 horas. Novo login substitui a sessão anterior. Sair revoga a sessão.
- Portal consulta apenas /portal/me para obter o próprio aluno e suas matrículas. Não aceita um ID de aluno escolhido pelo navegador.
- APIs administrativas exigem token administrativo. Tokens de aluno não abrem listagens da gestão nem emitem códigos.
- Treino exige aluno ativo e matrícula vigente. O servidor confere ao iniciar e finalizar. Aluno vencido vê Renovar meu plano e instruções para a recepção; aluno cancelado deve procurar a recepção.
- Renovação ocorre na gestão, atualizando a matrícula. Pagamento local continua uma simulação acadêmica e não renova o plano.
- Sessões administrativas e limites de tentativas são mantidos na memória do servidor; reiniciar revoga essas sessões/zera os limites. O protótipo não é uma implantação pronta para internet pública. Use HTTPS e configuração de produção antes de expor dados reais.

## Validação desta entrega
Sintaxe JavaScript e bloqueios visuais de aluno vencido/cancelado verificados com dados simulados. Acrescentado PortalTest para hash, código de uso único, sessão, vencimento, cancelamento e saída. Maven não concluiu: o ambiente negou acesso à dependência jackson-datatype-jsr310. Não houve validação ponta a ponta desta atualização com MySQL. Execute `mvn clean test` antes da apresentação.

Este guia substitui as descrições antigas de login demonstrativo somente no JavaScript e de acesso por seletor na área do aluno. Treinos, recibos e pagamentos permanecem simulações locais.
