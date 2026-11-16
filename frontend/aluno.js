/** FORJA ALUNO — aplicativo móvel demonstrativo. */
const API_ALUNO = 'http://localhost:8080/api';
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const hojeAluno = () => new Date().toISOString().slice(0, 10);
const dataBR = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
const dinheiro = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

let atual = null, matriculasAluno = [], pagina = sessionStorage.getItem('forjaAlunoPagina') || 'inicio';
let fichaSelecionada = 'A', relogio = null;
let estado = estadoNovo();

const fichas = {
  A: { nome: 'Superior — peito, ombros e tríceps', exercicios: [['Supino reto', '3 × 10'], ['Supino inclinado', '3 × 10'], ['Crucifixo', '3 × 12'], ['Desenvolvimento', '3 × 10'], ['Elevação lateral', '3 × 12'], ['Tríceps na polia', '3 × 12']] },
  B: { nome: 'Costas e bíceps', exercicios: [['Puxada frontal', '3 × 12'], ['Remada baixa', '3 × 12'], ['Remada unilateral', '3 × 10'], ['Pulldown', '3 × 12'], ['Rosca direta', '3 × 10'], ['Rosca martelo', '3 × 12']] },
  C: { nome: 'Inferior e abdômen', exercicios: [['Agachamento', '3 × 12'], ['Leg press', '3 × 12'], ['Cadeira extensora', '3 × 12'], ['Mesa flexora', '3 × 12'], ['Panturrilha', '3 × 15'], ['Prancha', '3 × 30 segundos']] }
};
const semana = [['Dom', 'Descanso'], ['Seg', 'A'], ['Ter', 'B'], ['Qua', 'C'], ['Qui', 'A'], ['Sex', 'B'], ['Sáb', 'C']];
const aulas = [
  { id: 'funcional-18', nome: 'Treino funcional', dia: 'Segunda', hora: '18:00', professor: 'Rafael', vagas: 8, tipo: 'FUNCIONAL' },
  { id: 'bike-19', nome: 'Bike indoor', dia: 'Terça', hora: '19:00', professor: 'Bianca', vagas: 5, tipo: 'CARDIO' },
  { id: 'mobilidade-7', nome: 'Mobilidade', dia: 'Quarta', hora: '07:00', professor: 'Marina', vagas: 10, tipo: 'BEM-ESTAR' },
  { id: 'hiit-18', nome: 'HIIT', dia: 'Quinta', hora: '18:30', professor: 'Rafael', vagas: 6, tipo: 'FUNCIONAL' },
  { id: 'alongamento-9', nome: 'Alongamento', dia: 'Sábado', hora: '09:00', professor: 'Marina', vagas: 12, tipo: 'BEM-ESTAR' }
];

function estadoNovo() { return { treinos: [], pagamentos: [], reservas: [], emCurso: false, fichaEmCurso: null, marcados: [], seriesConcluidas: {}, descansoSegundos: 60, descansoAtivo: null, iniciadoEm: null, segundosPausados: 0 }; }
function chave() { return `forja_aluno_demo_${atual.id}_${atual.dataCadastro}`; }
function carregarEstado() { try { const salvo = JSON.parse(localStorage.getItem(chave()) || 'null'); estado = salvo && Array.isArray(salvo.treinos) ? { ...estadoNovo(), ...salvo, seriesConcluidas: salvo.seriesConcluidas || {} } : estadoNovo(); } catch { estado = estadoNovo(); } }
function persistir() { localStorage.setItem(chave(), JSON.stringify(estado)); }
function mostrarMensagem(texto = '') { $('mensagem').textContent = texto; }

async function consultar(path, method = 'GET', body) {
  const resposta = await fetch(API_ALUNO + path, { method, cache: 'no-store', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('forjaAlunoToken') || ''}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const texto = await resposta.text(); let dados = {};
  try { dados = texto ? JSON.parse(texto) : {}; } catch { dados = {}; }
  if (!resposta.ok) {
    if (resposta.status === 401) sairAluno();
    throw new Error(dados.message || dados.detail || ({ 401: 'Acesso não autorizado. Entre novamente.', 403: 'Esta função não está disponível para sua situação atual.', 404: 'O servidor está sem esta atualização. Reinicie o backend atualizado.', 429: 'Muitas tentativas. Aguarde 15 minutos.', 500: 'Falha no servidor. Verifique o log do backend.' }[resposta.status] || `Falha ao acessar o servidor (HTTP ${resposta.status}).`));
  }
  return dados;
}
function vigente(m) { return m?.status === 'ATIVA' && m.dataInicio && m.dataFim && m.dataInicio <= hojeAluno() && m.dataFim >= hojeAluno() && m.plano?.ativo; }
function contrato() { return matriculasAluno.slice().sort((a, b) => Number(vigente(b)) - Number(vigente(a)) || String(b.dataFim).localeCompare(String(a.dataFim)))[0]; }
function situacao(m) { if (atual.status !== 'ATIVO') return 'Cadastro inativo'; if (!m || !vigente(m)) return 'Plano sem vigência'; return 'Plano vigente'; }
function podeTreinar() { return atual?.status === 'ATIVO' && vigente(contrato()); }
function fichaAtual() { return fichas[estado.emCurso ? estado.fichaEmCurso : fichaSelecionada] || fichas.A; }
function treinoDoDia() { return semana[new Date().getDay()][1]; }
function tempo(total) { const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60; return `${h ? `${String(h).padStart(2, '0')}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
function segundosTreino() { return estado.emCurso && estado.iniciadoEm ? estado.segundosPausados + Math.max(0, Math.floor((Date.now() - estado.iniciadoEm) / 1000)) : estado.segundosPausados; }
function segundosRestantes() { return estado.descansoAtivo ? Math.max(0, Math.ceil((estado.descansoAtivo.fim - Date.now()) / 1000)) : 0; }
function iniciarRelogio() { clearInterval(relogio); if (!estado.emCurso) return; relogio = setInterval(() => { const treino = $('cronometro'); if (treino) treino.textContent = tempo(segundosTreino()); const descanso = $('descansoTimer'); if (descanso) { const restante = segundosRestantes(); if (!restante && estado.descansoAtivo) { estado.descansoAtivo = null; persistir(); renderizar(); return; } descanso.textContent = tempo(restante); } }, 1000); }
function pararRelogio() { clearInterval(relogio); relogio = null; }

async function atualizarDados() { if (!sessionStorage.getItem('forjaAlunoToken')) return; try { const dados = await consultar('/portal/me'); atual = dados.aluno; matriculasAluno = dados.matriculas || []; carregarEstado(); abrirArea(); mostrarMensagem(); } catch (erro) { mostrarMensagem(erro.message); } }
function abrirArea() { $('conteudo').prepend($('mensagem')); $('entrada').hidden = true; $('conteudo').hidden = false; $('menu').hidden = false; $('sair').hidden = false; renderizar(); }
function sairAluno() { pararRelogio(); atual = null; sessionStorage.removeItem('forjaAlunoToken'); sessionStorage.removeItem('forjaAlunoPagina'); $('passoCpf').prepend($('mensagem')); $('entrada').hidden = false; $('conteudo').hidden = true; $('menu').hidden = true; $('sair').hidden = true; pagina = 'inicio'; }
function gradeSemanal() { return `<div class="semana" aria-label="Distribuição de fichas na semana">${[1, 2, 3, 4, 5, 6, 0].map(i => `<div class="dia ${i === new Date().getDay() ? 'hoje' : ''}"><small>${semana[i][0]}</small><b>${semana[i][1]}</b>${i === new Date().getDay() ? '<small>Hoje</small>' : ''}</div>`).join('')}</div>`; }
function bloqueioTreino() { return atual.status !== 'ATIVO' ? '<article class="warning"><h2>Treinos indisponíveis</h2><p>Seu cadastro está inativo. Entre em contato com a recepção para regularizar a situação.</p></article>' : '<article class="warning"><h2>Seu plano precisa de renovação</h2><p>Renove seu plano na recepção para liberar fichas, cronômetro e reservas de aula.</p><button class="primary" data-go="plano">Ver meu plano →</button></article>'; }
function quantidadeSeries(detalhes) { return Number(String(detalhes).match(/^(\d+)/)?.[1] || 1); }
function seriesFeitas(indice) { return estado.seriesConcluidas?.[indice] || []; }
function totalSeries(ficha) { return ficha.exercicios.reduce((total, [, detalhes]) => total + quantidadeSeries(detalhes), 0); }
function totalSeriesConcluidas() { return Object.values(estado.seriesConcluidas || {}).reduce((total, series) => total + series.length, 0); }
function todasSeriesConcluidas(ficha) { return totalSeriesConcluidas() === totalSeries(ficha); }

function telaInicio(m) {
  const hoje = treinoDoDia();
  return `<article class="hero"><span class="tag">SEU PRÓXIMO PASSO</span><h2>Construa a sua<br><em>melhor versão.</em></h2><p>${hoje === 'Descanso' ? 'Hoje é dia de descanso e recuperação.' : `Hoje: treino ${hoje} · ${fichas[hoje].nome}`}</p><button class="primary" data-go="treino">Abrir meus treinos →</button></article><div class="stats"><article><small>Treinos concluídos</small><b>${estado.treinos.length}</b></article><article><small>Aulas reservadas</small><b>${estado.reservas.length}</b></article></div><article><span class="badge ${podeTreinar() ? 'good' : ''}">${escapeHtml(situacao(m))}</span><h2>${escapeHtml(m?.plano?.nome || 'Sem plano')}</h2><p>Vencimento: ${dataBR(m?.dataFim)}</p><button data-go="plano">Plano e pagamentos</button></article>`;
}
function telaTreino() {
  if (!podeTreinar()) return bloqueioTreino();
  const ficha = fichaAtual(), exercicios = ficha.exercicios, emCurso = estado.emCurso, pausa = estado.descansoAtivo;
  const controlesSeries = exercicios.map(([nome, detalhes], indice) => {
    const quantidade = quantidadeSeries(detalhes), feitas = seriesFeitas(indice);
    return `<div class="exercise"><span><strong>${escapeHtml(nome)}</strong><small>${escapeHtml(detalhes)}</small></span><div class="series">${Array.from({ length: quantidade }, (_, serie) => `<button data-serie="${indice}:${serie + 1}" class="${feitas.includes(serie + 1) ? 'serie-concluida' : ''}" ${!emCurso || feitas.includes(serie + 1) ? 'disabled' : ''}>Série ${serie + 1}${feitas.includes(serie + 1) ? ' ✓' : ''}</button>`).join('')}</div></div>`;
  }).join('');
  return `<article><span class="tag">MINHA SEMANA</span><h2>Treinos A, B e C</h2>${gradeSemanal()}<p class="muted">Escolha qualquer ficha quando não houver treino em andamento.</p><div class="fichas">${['A', 'B', 'C'].map(letra => `<button data-ficha="${letra}" class="${fichaSelecionada === letra && !emCurso ? 'primary' : ''}" ${emCurso ? 'disabled' : ''}>Treino ${letra}</button>`).join('')}</div></article><article class="timer-card"><span class="tag">${emCurso ? 'TREINO EM ANDAMENTO' : 'FICHA SELECIONADA'}</span><h2>${emCurso ? estado.fichaEmCurso : fichaSelecionada} · ${escapeHtml(ficha.nome)}</h2><strong id="cronometro">${tempo(segundosTreino())}</strong><small>${emCurso ? 'Conclua cada série e faça o descanso entre elas.' : 'O cronômetro começa ao iniciar a ficha.'}</small></article><article class="descanso-card"><span class="tag">DESCANSO ENTRE SÉRIES</span><h2>Defina sua pausa</h2><div class="descanso-opcoes">${[30, 45, 60, 90, 120].map(segundos => `<button data-descanso="${segundos}" class="${estado.descansoSegundos === segundos ? 'primary' : ''}" ${emCurso ? 'disabled' : ''}>${segundos}s</button>`).join('')}</div>${pausa ? `<div class="pausa-ativa"><span>Pausa: exercício ${pausa.indice + 1}, série ${pausa.serie}</span><strong id="descansoTimer">${tempo(segundosRestantes())}</strong><button id="pularDescanso">Pular descanso</button></div>` : '<p class="muted">Ao concluir uma série, a contagem regressiva começa automaticamente.</p>'}</article><article><progress max="${totalSeries(ficha)}" value="${totalSeriesConcluidas()}"></progress><p>${totalSeriesConcluidas()} de ${totalSeries(ficha)} séries concluídas</p>${controlesSeries}<button class="primary" id="acaoTreino" ${emCurso && !todasSeriesConcluidas(ficha) ? 'disabled' : ''}>${emCurso ? 'Finalizar treino' : 'Iniciar treino'}</button>${emCurso ? '<button id="cancelarTreino">Cancelar treino</button>' : ''}</article>`;
}
function telaAulas() {
  if (!podeTreinar()) return bloqueioTreino();
  return `<article><span class="tag">AGENDA DA FORJA</span><h2>Aulas da semana</h2><p>Reserve uma vaga na aula que combina com seu treino.</p></article>${aulas.map(aula => { const reservada = estado.reservas.includes(aula.id); return `<article class="aula"><span class="badge">${aula.tipo}</span><h2>${aula.nome}</h2><p>${aula.dia} · ${aula.hora}<br>Professor(a): ${aula.professor} · ${aula.vagas} vagas</p><button data-aula="${aula.id}" class="${reservada ? 'reserved' : 'primary'}">${reservada ? 'Cancelar reserva' : 'Reservar vaga'}</button></article>`; }).join('')}<p class="muted">Reservas são uma simulação local e não bloqueiam vagas reais.</p>`;
}
function telaPlano(m) {
  const pago = m && estado.pagamentos.find(item => item.referencia === `${m.id}:${m.plano.id}:${m.dataFim}`);
  return `${!podeTreinar() ? bloqueioTreino() : ''}<article><span class="badge ${podeTreinar() ? 'good' : ''}">${escapeHtml(situacao(m))}</span><h2>${escapeHtml(m?.plano?.nome || 'Sem matrícula')}</h2>${m ? `<h1>${dinheiro(m.plano.valor)}</h1><p>Valor do plano · ${m.plano.duracaoMeses} mês(es)</p><dl><dt>Início</dt><dd>${dataBR(m.dataInicio)}</dd><dt>Vencimento</dt><dd>${dataBR(m.dataFim)}</dd><dt>Situação demonstrativa</dt><dd>${pago ? 'Pago (simulado)' : 'Pendente (simulado)'}</dd></dl><button class="primary" id="pagar" ${pago ? 'disabled' : ''}>${pago ? 'Pagamento simulado concluído' : 'Simular pagamento'}</button>` : '<p>Procure a recepção para contratar um plano.</p>'}<p class="muted">A simulação não cobra dinheiro e não altera a matrícula do banco.</p></article><h2>Comprovantes</h2>${estado.pagamentos.length ? estado.pagamentos.slice().reverse().map(item => `<article class="receipt"><span class="tag">SIMULAÇÃO ACADÊMICA — SEM VALOR FISCAL</span><h3>${escapeHtml(item.plano)}</h3><p>${dinheiro(item.valor)} · ${dataBR(item.data)}</p><small>Comprovante ${escapeHtml(item.id)}</small></article>`).join('') : '<p class="empty">Nenhum pagamento simulado.</p>'}`;
}
function telaPerfil(m) { return `<article><h2>${escapeHtml(atual.nome)}</h2><span class="badge">ID do aluno ${atual.id}</span><dl>${[['CPF', atual.cpf], ['Telefone', atual.telefone], ['E-mail', atual.email], ['Nascimento', dataBR(atual.dataNascimento)], ['Cadastro', dataBR(atual.dataCadastro)], ['Plano', m?.plano?.nome], ['Matrícula', m?.id]].map(([titulo, valor]) => `<dt>${titulo}</dt><dd>${escapeHtml(valor || 'Não informado')}</dd>`).join('')}</dl></article><p>Os dados são provenientes do cadastro da academia. Use Atualizar dados depois de uma alteração pela recepção.</p>`; }

function renderizar() {
  if (!['inicio', 'treino', 'aulas', 'plano', 'perfil'].includes(pagina)) pagina = 'inicio';
  sessionStorage.setItem('forjaAlunoPagina', pagina);
  document.querySelectorAll('#menu button').forEach(botao => botao.classList.toggle('active', botao.dataset.page === pagina));
  const m = contrato();
  $('titulo').textContent = { inicio: `Olá, ${atual.nome.split(' ')[0]}.`, treino: 'Meus treinos', aulas: 'Aulas e agenda', plano: 'Plano e pagamentos', perfil: 'Meu perfil' }[pagina];
  $('tela').innerHTML = ({ inicio: telaInicio(m), treino: telaTreino(), aulas: telaAulas(), plano: telaPlano(m), perfil: telaPerfil(m) })[pagina];
  iniciarRelogio();
}

async function autenticarAluno(ativar = false) {
  try { const senha = ativar ? $('novaSenha').value : $('senhaLogin').value; if (ativar && senha !== $('confirmarSenha').value) throw new Error('As senhas não conferem.'); const resposta = await consultar(ativar ? '/portal/ativar' : '/portal/entrar', 'POST', { cpf: cpfConfirmado, senha, codigo: $('codigoLogin').value.trim() }); sessionStorage.setItem('forjaAlunoToken', resposta.token); await atualizarDados(); } catch (erro) { mostrarMensagem(erro.message); }
}

$('entrar').onclick = () => autenticarAluno();
$('ativar').onclick = () => autenticarAluno(true);
$('sair').onclick = async () => { try { await consultar('/portal/sair', 'POST'); } finally { sairAluno(); } };
$('atualizar').onclick = atualizarDados;
$('menu').onclick = evento => { const botao = evento.target.closest('[data-page]'); if (botao) { pagina = botao.dataset.page; renderizar(); window.scrollTo(0, 0); } };
$('tela').onclick = async evento => {
  try {
    const proxima = evento.target.closest('[data-go]'); if (proxima) { pagina = proxima.dataset.go; renderizar(); return; }
    const escolha = evento.target.closest('[data-ficha]'); if (escolha && !estado.emCurso) { fichaSelecionada = escolha.dataset.ficha; renderizar(); return; }
    const descanso = evento.target.closest('[data-descanso]'); if (descanso && !estado.emCurso) { estado.descansoSegundos = Number(descanso.dataset.descanso); persistir(); renderizar(); return; }
    const serie = evento.target.closest('[data-serie]');
    if (serie && estado.emCurso) {
      const [indiceTexto, numeroTexto] = serie.dataset.serie.split(':'); const indice = Number(indiceTexto), numero = Number(numeroTexto);
      const concluidas = new Set(seriesFeitas(indice)); concluidas.add(numero);
      estado.seriesConcluidas = { ...estado.seriesConcluidas, [indice]: [...concluidas].sort((a, b) => a - b) };
      estado.descansoAtivo = { indice, serie: numero, fim: Date.now() + estado.descansoSegundos * 1000 };
      persistir(); renderizar(); return;
    }
    const aula = evento.target.closest('[data-aula]'); if (aula) { const id = aula.dataset.aula; estado.reservas = estado.reservas.includes(id) ? estado.reservas.filter(item => item !== id) : [...estado.reservas, id]; persistir(); renderizar(); return; }
    if (evento.target.id === 'pularDescanso') { estado.descansoAtivo = null; persistir(); renderizar(); }
    if (evento.target.id === 'acaoTreino') { await consultar('/portal/treino'); if (!estado.emCurso) { estado.emCurso = true; estado.fichaEmCurso = fichaSelecionada; estado.marcados = []; estado.seriesConcluidas = {}; estado.descansoAtivo = null; estado.iniciadoEm = Date.now(); estado.segundosPausados = 0; } else { const ficha = fichaAtual(); estado.treinos.push({ id: Date.now(), data: hojeAluno(), ficha: estado.fichaEmCurso, nome: ficha.nome, exercicios: ficha.exercicios.length, series: totalSeries(ficha), duracao: segundosTreino() }); estado = { ...estado, emCurso: false, fichaEmCurso: null, marcados: [], seriesConcluidas: {}, descansoAtivo: null, iniciadoEm: null, segundosPausados: 0 }; mostrarMensagem('Treino concluído! Sua evolução foi atualizada.'); } persistir(); renderizar(); }
    if (evento.target.id === 'cancelarTreino') { estado = { ...estado, emCurso: false, fichaEmCurso: null, marcados: [], seriesConcluidas: {}, descansoAtivo: null, iniciadoEm: null, segundosPausados: 0 }; persistir(); renderizar(); }
    if (evento.target.id === 'pagar') { const m = contrato(); if (!m) return; const referencia = `${m.id}:${m.plano.id}:${m.dataFim}`; if (!confirm('Simular o pagamento? Nenhum valor será cobrado.')) return; estado.pagamentos.push({ referencia, plano: m.plano.nome, valor: m.plano.valor, data: hojeAluno(), id: `DEMO-${Date.now()}` }); persistir(); renderizar(); }
  } catch (erro) { mostrarMensagem(erro.message); }
};

let cpfConfirmado = '';
function etapaAcesso(etapa) { for (const id of ['passoCpf', 'passoSenha', 'passoCriar', 'passoNaoEncontrado']) $(id).hidden = id !== etapa; $(etapa).prepend($('mensagem')); $('voltarCpf').hidden = etapa === 'passoCpf'; mostrarMensagem(); }
$('continuarCpf').onclick = async () => { const botao = $('continuarCpf'); botao.disabled = true; try { const cpf = $('cpfLogin').value.replace(/\D/g, ''); const resposta = await consultar('/portal/identificar', 'POST', { cpf }); cpfConfirmado = cpf; $('cpfIdentificado').textContent = `CPF: ${$('cpfLogin').value}`; $('cpfCriacao').textContent = `CPF: ${$('cpfLogin').value}`; etapaAcesso(resposta.etapa === 'SENHA' ? 'passoSenha' : resposta.etapa === 'CRIAR_SENHA' ? 'passoCriar' : 'passoNaoEncontrado'); } catch (erro) { mostrarMensagem(erro.message); } finally { botao.disabled = false; } };
$('voltarCpf').onclick = () => { cpfConfirmado = ''; etapaAcesso('passoCpf'); };
$('esqueciSenha').onclick = () => etapaAcesso('passoCriar');
$('cpfLogin').onkeydown = evento => { if (evento.key === 'Enter') $('continuarCpf').click(); };
window.addEventListener('focus', () => { if (atual) atualizarDados(); });
atualizarDados();
