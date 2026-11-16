/**
 * FORJA ACADEMIA — COMPORTAMENTO DO FRONTEND
 * Este arquivo conecta os elementos de index.html às rotas do backend.
 * Organização: configuração → navegação → alunos/planos → matrículas/status
 * → reconhecimento facial → inicialização → máscaras de entrada.
 * Os nomes das funções também são usados nos eventos onclick/oninput do HTML.
 */

// CONFIGURAÇÃO E ESTADO: endereços, webcam, modelos e dados selecionados.
const API = 'http://localhost:8080/api';
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';
let stream = null, modelsReady = false, modelPromise = null, faceMatcher = null;
let alunos = [], planos = [], matriculas = [], selecionado = null, salvando = false;
const el = id => document.getElementById(id);
const val = id => el(id).value;
/** Escapa caracteres especiais antes de inserir textos do banco no HTML, evitando interpretar dados como marcação. */
function esc(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
/** Retorna a data local no formato AAAA-MM-DD; offset permite calcular ontem ou uma data futura. */
function hoje(offset = 0) { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
/** Centraliza chamadas HTTP ao backend e transforma respostas de erro em mensagens para a interface. */
async function api(path, method = 'GET', body) {
  const r = await fetch(API + path, {method, headers:{'Content-Type':'application/json','Authorization':'Bearer '+(sessionStorage.getItem('forjaAdminToken')||'')}, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
  const text = await r.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(data?.message || `Falha HTTP ${r.status}: ${typeof data === 'string' ? data : 'verifique os dados'}`);
  return data;
}
/** Confere as credenciais demonstrativas, mostra o sistema e carrega os dados iniciais. Não autentica o backend. */
async function login() { try { const r=await api('/sessao','POST',{usuario:val('user'),senha:val('pass')});sessionStorage.setItem('forjaAdminToken',r.token);sessionStorage.logado='1';el('login').classList.add('hidden');el('app').classList.remove('hidden');await loadAll(); } catch(e){el('loginMsg').textContent='Falha no login: '+e.message;} }
/** Encerra a câmera e a sessão demonstrativa, preservando os descritores faciais do navegador. */
function logout() { pararCamera(); sessionStorage.removeItem('forjaAdminToken'); sessionStorage.removeItem('logado'); sessionStorage.removeItem('forjaSecao'); location.reload(); }
/** Alterna a seção visível, destaca a navegação e busca os dados necessários à tela escolhida. */
async function show(id) {
  // Guarda a seção desta aba para restaurá-la ao atualizar o navegador.
  if (!['dashboard', 'alunos', 'planos', 'acesso'].includes(id)) id = 'dashboard';
  sessionStorage.setItem('forjaSecao', id);
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick')==="show('"+id+"')"));
  document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden')); el(id).classList.remove('hidden');
  try { if(id==='alunos') await Promise.all([loadAlunos(),loadPlanos()]); if(id==='planos') await loadPlanos(); if(id==='dashboard') await loadDashboard(); if(id==='acesso') await loadAlunosParaFace(); }
  catch(e) { alert(e.message); }
}
/** Busca os indicadores existentes no banco e monta os cartões do painel. */
async function loadDashboard() { const d=await api('/dashboard'); el('cards').innerHTML=`<div class="metric">Alunos ativos<b>${Number(d.alunosAtivos)}</b></div><div class="metric">Pagamentos vencidos<b>${Number(d.pagamentosVencidos)}</b></div><div class="metric">Entradas autorizadas<b>${Number(d.entradasRegistradas)}</b></div>`; }
/** Verifica status, datas e plano ativo para apresentar a mesma regra de vigência usada no backend. */
function vigente(m) { return m.status==='ATIVA' && m.dataInicio && m.dataFim && m.dataInicio<=hoje() && m.dataFim>=hoje() && m.plano?.ativo===true; }
/** Filtra as matrículas pertencentes ao aluno informado. */
function doAluno(id) { return matriculas.filter(m=>String(m.aluno.id)===String(id)); }
/** Prioriza uma matrícula vigente; na ausência, escolhe a de maior vencimento para exibição e edição. */
function matriculaAtual(id) { return doAluno(id).sort((a,b)=>Number(vigente(b))-Number(vigente(a)) || (b.dataFim||'').localeCompare(a.dataFim||'') || b.id-a.id)[0]; }
/** Busca alunos e matrículas em paralelo e atualiza a tabela. */
async function loadAlunos() { [alunos,matriculas]=await Promise.all([api('/alunos'),api('/matriculas')]); renderAlunos(alunos); }
/** Monta as nove colunas e os botões de cada aluno, incluindo plano, vencimento e situação facial. */
function renderAlunos(lista) {
  el('alunosTabela').innerHTML=lista.map(a=>{ const m=matriculaAtual(a.id); return `<tr ${String(selecionado)===String(a.id)?'class="aluno-selecionado"':''}><td><label class="selecao-aluno"><input type="radio" name="alunoSelecionado" value="${a.id}" aria-label="Selecionar aluno ${a.id}" ${String(selecionado)===String(a.id)?'checked':''} onclick="alternarSelecaoAluno(${a.id})"><span>${a.id}</span></label></td><td>${esc(a.nome)}</td><td>${esc(a.cpf)}</td><td>${esc(m?.plano?.nome || 'Sem plano')}</td><td>${esc(({CARTAO:'Cartão',PIX:'Pix',DINHEIRO:'Dinheiro'})[m?.meioPagamento] || 'Não informado')}</td><td>${esc(m?.dataFim || '—')}</td><td>${esc(a.status)} / ${esc(situacaoMatricula(m))}</td><td>${a.identificadorBiometrico ? (localStorage.getItem(key(a.id))?'✓ Cadastrado':'Vínculo no banco; rosto ausente neste navegador'):'—'}${localStorage.getItem('gym_photo_'+a.id)?`<button onclick="verFotoAluno(${a.id})">Ver foto</button>`:''}</td><td><button onclick="editarAluno(${a.id})">Editar dados</button> <button onclick="abrirEdicaoPlano(${a.id})">Plano</button> ${a.status==='ATIVO'?`<button onclick="cadastrarFacePorId(${a.id})">📷 Face</button><button onclick="cancelar(${a.id})">Cancelar</button>`:`<button onclick="reativar(${a.id})">Reativar</button>`}<button onclick="gerarAtivacao(${a.id})">Código de acesso</button><button class="danger" onclick="excluirAluno(${a.id})">Excluir</button></td></tr>`; }).join('');
}
/** Carrega a tabela e os dois seletores de plano, preservando a seleção e desabilitando planos inativos. */
async function loadPlanos() {
  planos=await api('/planos'); el('planosTabela').innerHTML=planos.map(p=>`<tr><td>${esc(p.nome)}</td><td>${esc(p.modalidade)}</td><td>${p.duracaoMeses} meses</td><td>R$ ${Number(p.valor).toFixed(2)}</td></tr>`).join('');
  for(const id of ['planoAluno','novoPlanoAluno']) { const anterior=val(id); el(id).innerHTML='<option value="">Selecione um plano *</option>'+planos.map(p=>`<option value="${p.id}" ${p.ativo?'':'disabled'}>${esc(p.nome)}${p.ativo?'':' (inativo)'}</option>`).join(''); el(id).value=anterior; }
}
/** Guarda o aluno das ações de apresentação e destaca sua linha na tabela. */
function selecionarAluno(id) { selecionado=id; fecharEdicaoPlano(); const a=alunos.find(x=>x.id===id); el('alunoMsg').textContent=`Selecionado: ${a?.nome || id} (ID ${id})`; renderAlunos(alunos); }
/** Preenche o formulário com dados existentes. A matrícula é editada separadamente pelo botão Plano. */
function editarAluno(id) { selecionarAluno(id); const a=alunos.find(x=>x.id===id); el('alunoId').value=id; for(const [campo,prop] of Object.entries({nome:'nome',cpf:'cpf',nascimento:'dataNascimento',telefone:'telefone',email:'email'})) el(campo).value=campo==='cpf'?formatarCpf(a[prop]||''):campo==='telefone'?formatarTelefone(a[prop]||''):a[prop]||''; el('meioPagamento').disabled=true; el('planoAluno').disabled=true; el('inicioPlano').disabled=true; el('alunoMsg').textContent='Edição de dados. Para alterar a matrícula, use o botão Plano.'; }
/** Limpa a edição, libera a escolha de plano e sugere a data atual para um novo cadastro. */
function limparFormularioAluno() { for(const id of ['alunoId','nome','cpf','nascimento','telefone','email','planoAluno','meioPagamento']) el(id).value=''; el('inicioPlano').value=hoje(); el('meioPagamento').disabled=false; el('planoAluno').disabled=false; el('inicioPlano').disabled=false; el('alunoMsg').textContent=''; }
/** Atualiza os dados de um aluno existente ou cria aluno e matrícula. Mantém o ID em caso de falha parcial. */
async function salvarAlunoComPlano() {
  if(salvando) return; salvando=true;
  try {
    const id=val('alunoId'), body={nome:val('nome').trim(),cpf:val('cpf').trim(),dataNascimento:val('nascimento')||null,telefone:val('telefone'),email:val('email')};
    if(!body.nome || !body.cpf) throw new Error('Preencha nome e CPF.');
    if(id) { await api('/alunos/'+id,'PUT',body); el('alunoMsg').textContent='Dados atualizados. Status e facial preservados.'; }
    else {
      if(!val('planoAluno')) throw new Error('Selecione um plano.');
      const a=await api('/alunos','POST',body);
      // Guarde o ID mesmo se a matrícula falhar, evitando cadastrar o aluno novamente.
      el('alunoId').value=a.id; selecionado=a.id; el('meioPagamento').disabled=true; el('planoAluno').disabled=true; el('inicioPlano').disabled=true;
      try { await api('/matriculas','POST',{alunoId:a.id,planoId:Number(val('planoAluno')),inicio:val('inicioPlano')||hoje(),meioPagamento:val('meioPagamento')||null}); }
      catch(e) { throw new Error(`Aluno ${a.id} criado, mas a matrícula falhou: ${e.message}. Atualize a lista e use Plano para concluir o vínculo.`); }
      limparFormularioAluno(); el('alunoMsg').textContent='Aluno e plano cadastrados!';
    }
    try { await loadAlunos(); } catch(e) { el('alunoMsg').textContent+=' Gravação concluída; falha ao atualizar a lista: '+e.message; }
  } catch(e) { el('alunoMsg').textContent=e.message; } finally { salvando=false; }
}
/** Carrega a matrícula escolhida e abre o formulário com plano, datas e status. */
async function abrirEdicaoPlano(id=selecionado) {
  try { if(!id) throw new Error('Selecione um aluno.'); await Promise.all([loadAlunos(),loadPlanos()]); selecionarAluno(id); const m=matriculaAtual(id); el('matriculaAlunoId').value=m?.id||''; el('novoPlanoAluno').value=m?.plano?.id||''; el('novaDataInicioPlano').value=m?.dataInicio||hoje(); el('fimPlano').value=m?.dataFim||''; el('statusMatricula').value=m?.status||'ATIVA'; el('editarMeioPagamento').value=m?.meioPagamento||''; el('modalPlano').classList.remove('hidden'); el('planoAlunoMsg').textContent=m?`Editando matrícula ${m.id}. Há ${doAluno(id).length} matrícula(s) deste aluno.`:'Aluno sem matrícula. Salvar criará o vínculo.'; }
  catch(e) { alert(e.message); }
}
/** Oculta o formulário de matrícula e limpa o ID usado na edição. */
function fecharEdicaoPlano() { el('modalPlano').classList.add('hidden'); el('matriculaAlunoId').value=''; }
/** Usa PUT para editar a matrícula existente e POST somente quando o aluno não possui matrícula. */
async function salvarPlanoAluno() {
  if(salvando) return; salvando=true;
  try {
    if(!selecionado || !val('novoPlanoAluno')) throw new Error('Selecione o aluno e o plano.');
    const id=val('matriculaAlunoId'), inicio=val('novaDataInicioPlano'), dataFim=val('fimPlano');
    if(!inicio || (dataFim && dataFim<inicio)) throw new Error('Vencimento deve ser igual ou posterior ao início.');
    await api('/matriculas'+(id?'/'+id:''),id?'PUT':'POST',{alunoId:selecionado,planoId:Number(val('novoPlanoAluno')),inicio,dataFim:dataFim||null,status:val('statusMatricula'),meioPagamento:val('editarMeioPagamento')});
    fecharEdicaoPlano(); el('alunoMsg').textContent='Matrícula salva no banco.';
    try { await loadAlunos(); } catch(e) { el('alunoMsg').textContent+=' Atualize a lista: '+e.message; }
  } catch(e) { el('planoAlunoMsg').textContent=e.message; } finally { salvando=false; }
}
/** Persiste o vencimento de todas as matrículas ativas do aluno para demonstrar a negativa de acesso. */
async function simularPlanoVencido() {
  if(salvando) return; salvando=true;
  try {
    if(!selecionado) throw new Error('Selecione um aluno na tabela.');
    await loadAlunos(); const lista=doAluno(selecionado).filter(m=>m.status==='ATIVA');
    if(!lista.length) throw new Error('Aluno sem matrícula ativa para simular.');
    // Vence todas as matrículas ativas para nenhuma outra continuar autorizando.
    for(const m of lista) await api('/matriculas/'+m.id,'PUT',{planoId:m.plano.id,inicio:m.dataInicio && m.dataInicio<=hoje(-1)?m.dataInicio:hoje(-2),dataFim:hoje(-1),status:m.status});
    fecharEdicaoPlano(); el('alunoMsg').textContent='Vencimento persistido no banco para todas as matrículas ativas do aluno.';
    await loadAlunos();
  } catch(e) { el('alunoMsg').textContent='Simulação não concluída: '+e.message+' Confira a lista antes de tentar novamente.'; } finally { salvando=false; }
}
/** Chama a operação explícita de cancelamento ou reativação e atualiza a listagem. */
async function mudarStatus(id,acao) { try { if(!id) throw new Error('Selecione um aluno.'); await api('/alunos/'+id+'/'+acao,'PUT'); el('alunoMsg').textContent=acao==='cancelar'?'Aluno cancelado; histórico e facial preservados.':'Aluno reativado; o acesso ainda depende de matrícula vigente.'; await loadAlunos(); } catch(e) { alert(e.message); } }
/** Encaminha o cancelamento de um aluno sem excluir seus dados. */
function cancelar(id) { return mudarStatus(id,'cancelar'); }
/** Encaminha a reativação; o acesso ainda depende de plano vigente. */
function reativar(id) { return mudarStatus(id,'reativar'); }
/** Aplica o cancelamento ao aluno selecionado no painel de demonstração. */
function cancelarAlunoSelecionado() { return cancelar(selecionado); }
/** Aplica a reativação ao aluno selecionado no painel de demonstração. */
function reativarAlunoSelecionado() { return reativar(selecionado); }
/** Mantém o nome da chave local do descritor facial, compatível com cadastros anteriores. */
function key(id) { return 'gym_face_'+id; }
/** Carrega os modelos faciais uma única vez e informa falhas da biblioteca externa. */
async function prepararModelos() {
  if(typeof faceapi === 'undefined') throw new Error('A biblioteca facial ainda não carregou. Verifique a conexão com cdn.jsdelivr.net e tente novamente. Os demais cadastros funcionam sem ela.');
  if(modelsReady) return;
  if(!modelPromise) modelPromise=(async()=>{ el('cameraMsg').textContent='Carregando modelos faciais...'; await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)]); modelsReady=true; })().catch(e=>{ modelPromise=null; throw new Error('Não foi possível carregar os modelos faciais. Verifique a internet.'); });
  await modelPromise;
}
/** Solicita a webcam, aguarda uma imagem utilizável e devolve o elemento de vídeo. */
async function cameraPronta() {
  await prepararModelos(); const v=el('video');
  if(!stream) { if(!navigator.mediaDevices?.getUserMedia) throw new Error('Abra em localhost e permita a webcam.'); stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false}); v.srcObject=stream; }
  await v.play();
  if(v.readyState<2) await new Promise((resolve,reject)=>{ const timer=setTimeout(()=>{v.removeEventListener('loadeddata',ready);reject(new Error('A câmera não forneceu imagem.'));},10000); function ready(){clearTimeout(timer);resolve();} v.addEventListener('loadeddata',ready,{once:true}); });
  el('cameraMsg').textContent='Webcam pronta. Posicione o rosto no guia.'; return v;
}
/** Inicia a preparação da câmera e apresenta erros ao usuário. */
async function iniciarCamera() { try { await cameraPronta(); } catch(e) { el('cameraMsg').textContent=e.message; } }
/** Libera as trilhas da webcam e remove o vídeo da tela. */
function pararCamera() { if(stream) stream.getTracks().forEach(t=>t.stop()); stream=null; el('video').srcObject=null; }
/** Preenche o seletor de cadastro facial apenas com alunos ativos. */
async function loadAlunosParaFace() { const lista=await api('/alunos'), anterior=val('alunoFace'); el('alunoFace').innerHTML=lista.filter(a=>a.status==='ATIVO').map(a=>`<option value="${a.id}">${a.id} — ${esc(a.nome)}</option>`).join(''); if(lista.some(a=>String(a.id)===anterior && a.status==='ATIVO')) el('alunoFace').value=anterior; }
/** Abre a tela facial com o aluno escolhido e prepara a câmera para a captura. */
async function cadastrarFacePorId(id) { await show('acesso'); el('alunoFace').value=String(id); await iniciarCamera(); }
/** Monta o comparador usando descritores locais vinculados ao banco, inclusive de cancelados para registrar negativas. */
async function montarMatcher(lista) { if(!lista) lista=await api('/alunos'); const labeled=[]; for(const a of lista) { const raw=localStorage.getItem(key(a.id)); if(raw && a.identificadorBiometrico) { try { const d=JSON.parse(raw); if(d.length===128 && d.every(Number.isFinite)) labeled.push(new faceapi.LabeledFaceDescriptors(String(a.id),[new Float32Array(d)])); } catch {} } } faceMatcher=labeled.length?new faceapi.FaceMatcher(labeled,0.52):null; }
/** Captura o descritor, vincula FACE:id no banco e guarda o descritor neste navegador. */
async function cadastrarRosto() { try { const id=val('alunoFace'); if(!id) throw new Error('Selecione um aluno ativo.'); const video=await cameraPronta(); const det=await faceapi.detectSingleFace(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor(); if(!det) throw new Error('Nenhum rosto detectado. Olhe para a câmera.'); const canvas=document.createElement('canvas'); canvas.width=320; canvas.height=Math.round(320*video.videoHeight/video.videoWidth); canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height); const foto=canvas.toDataURL('image/jpeg',0.8); await api('/alunos/'+id+'/biometria-facial','PUT'); localStorage.setItem('gym_photo_'+id,foto); localStorage.setItem(key(id),JSON.stringify(Array.from(det.descriptor))); await montarMatcher(); mostrarResultado(true,'Rosto cadastrado para o aluno selecionado.'); } catch(e) { mostrarResultado(false,e.message); } }
/** Compara o rosto e consulta /acesso/verificar com o vínculo existente, sem recadastrar a biometria. */
async function autenticarRosto() {
  try {
    const video=await cameraPronta(), lista=await api('/alunos'); await montarMatcher(lista);
    if(!faceMatcher) throw new Error('Nenhum rosto vinculado neste navegador. Cadastre o rosto primeiro.');
    const det=await faceapi.detectSingleFace(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    if(!det) throw new Error('Nenhum rosto detectado.');
    const best=faceMatcher.findBestMatch(det.descriptor); if(best.label==='unknown') throw new Error('Rosto não reconhecido.');
    const aluno=lista.find(a=>String(a.id)===best.label); if(!aluno?.identificadorBiometrico) throw new Error('Biometria não vinculada no banco.');
    const resp=await api('/acesso/verificar','POST',{biometria:aluno.identificadorBiometrico});
    mostrarResultado(resp.autorizado,resp.motivo+(resp.aluno?' — '+resp.aluno:''));
  } catch(e) { mostrarResultado(false,e.message); }
}
/** Exibe a autorização ou negativa com mensagem e cor correspondentes. */
function mostrarResultado(ok,msg) { const e=el('resultado'); e.className=ok?'ok':'bad'; e.textContent=(ok?'✓ ':'✕ ')+msg; }
/** Carrega os dados iniciais das três áreas e informa indisponibilidade do backend. */
async function loadAll() { try { await Promise.all([loadDashboard(),loadAlunos(),loadPlanos()]); } catch(e) { alert('Falha ao carregar dados: '+e.message); } }
// INICIALIZAÇÃO: executada quando o script termina de carregar.
limparFormularioAluno();
// Restaura a navegação da aba sem reabrir a câmera automaticamente.
if(sessionStorage.logado==='1' && sessionStorage.getItem('forjaAdminToken')) { el('login').classList.add('hidden'); el('app').classList.remove('hidden'); show(sessionStorage.getItem('forjaSecao') || 'dashboard'); }

// Máscaras aceitam digitação, colagem e exclusão; telefone suporta fixo e celular.
/** Aplica a máscara 000.000.000-00 aos primeiros onze dígitos. */
function formatarCpf(valor) {
  return String(valor).replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}
/** Aplica DDD e hífen, distinguindo telefone fixo de dez dígitos e celular de onze. */
function formatarTelefone(valor) {
  const d = String(valor).replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return '(' + d;
  const numero = d.slice(2), corte = numero.length > 8 ? 5 : 4;
  return '(' + d.slice(0, 2) + ') ' + numero.slice(0, corte)
    + (numero.length > corte ? '-' + numero.slice(corte) : '');
}
/** Formata o campo durante a digitação ou colagem e reposiciona o cursor pelo número de dígitos. */
function aplicarMascara(campo, formatar) {
  const antes = campo.value;
  const cursor = campo.selectionStart ?? antes.length;
  const digitosAntes = antes.slice(0, cursor).replace(/\D/g, '').length;
  campo.value = formatar(antes);
  let pos = 0, contagem = 0;
  while (pos < campo.value.length && contagem < digitosAntes) {
    if (/\d/.test(campo.value[pos])) contagem++;
    pos++;
  }
  campo.setSelectionRange(pos, pos);
}

/** Descreve a vigência sem alterar o status persistido: o vencimento depende da data final do plano. */
function situacaoMatricula(m) {
  if (!m) return 'SEM MATRÍCULA';
  if (m.status !== 'ATIVA') return m.status;
  if (!m.dataInicio || !m.dataFim) return 'DATAS INCOMPLETAS';
  if (m.dataFim < hoje()) return 'VENCIDO';
  if (m.dataInicio > hoje()) return 'AINDA NÃO INICIADO';
  if (!m.plano?.ativo) return 'PLANO INATIVO';
  return 'VIGENTE';
}

/** A segunda marcação limpa a seleção sem alterar o aluno ou a matrícula. */
function alternarSelecaoAluno(id) {
  if (String(selecionado) !== String(id)) { selecionarAluno(id); return; }
  selecionado = null;
  fecharEdicaoPlano();
  el('alunoMsg').textContent = 'Nenhum aluno selecionado.';
  renderAlunos(alunos);
}

/** Solicita confirmação explícita antes da exclusão permanente e limpa os dados locais. */
async function excluirAluno(id) {
  const aluno = alunos.find(a => a.id === id);
  if (!confirm(`Excluir definitivamente ${aluno?.nome || id}? Esta ação remove matrícula, pagamentos, frequência e cadastro facial. Não pode ser desfeita.`)) return;
  try {
    await api('/alunos/' + id, 'DELETE');
    localStorage.removeItem(key(id));
    localStorage.removeItem('gym_photo_' + id);
    faceMatcher = null;
    if (String(selecionado) === String(id)) { selecionado = null; fecharEdicaoPlano(); }
    if (String(val('alunoId')) === String(id)) limparFormularioAluno();
    fecharFotoAluno();
    el('alunoMsg').textContent = 'Aluno excluído definitivamente.';
    await loadAlunos();
    await loadAlunosParaFace();
    await loadDashboard();
  } catch (e) { alert('Não foi possível concluir a operação: ' + e.message); }
}

/** Exibe a foto capturada neste navegador, sem enviar a imagem a terceiros. */
function verFotoAluno(id) {
  const foto = localStorage.getItem('gym_photo_' + id);
  if (!foto || !foto.startsWith('data:image/jpeg;base64,')) return;
  el('fotoAlunoImagem').src = foto;
  el('fotoAlunoTitulo').textContent = 'Foto de ' + (alunos.find(a => a.id === id)?.nome || id);
  el('fotoAlunoDialog').showModal();
}
function fecharFotoAluno() {
  el('fotoAlunoDialog').close();
  el('fotoAlunoImagem').removeAttribute('src');
}

/** Recepção entrega o código após conferir a identidade, inclusive para recuperação de senha. */
let alunoCodigo=null, codigoTimer=null;
async function gerarAtivacao(id) {
 try {const r=await api('/alunos/'+id+'/ativacao','POST');alunoCodigo=id;
 el('codigoValor').textContent=r.codigo;el('codigoDialog').showModal();await atualizarStatusCodigo();
 clearInterval(codigoTimer);codigoTimer=setInterval(atualizarStatusCodigo,5000);
 }catch(e){alert(e.message)}
}
/** O status é consultado no banco; criar senha consome o código associado ao CPF. */
async function atualizarStatusCodigo(){
 if(!alunoCodigo)return;
 try{const r=await api('/alunos/'+alunoCodigo+'/ativacao');el('codigoDestinatario').textContent=r.nome+' — CPF '+r.cpf;
 el('codigoStatus').textContent=r.status==='USADO'?'✓ Código usado. Senha criada/redefinida com sucesso.':r.status==='PENDENTE'?'Aguardando o aluno utilizar o código.':'Código '+r.status.toLowerCase()+'.';
 if(r.status!=='PENDENTE')clearInterval(codigoTimer);
 }catch(e){el('codigoStatus').textContent=e.message;clearInterval(codigoTimer)}
}
function fecharCodigo(){clearInterval(codigoTimer);alunoCodigo=null;el('codigoDialog').close();el('codigoValor').textContent='';}
el('codigoDialog').addEventListener('close',()=>{clearInterval(codigoTimer);alunoCodigo=null;el('codigoValor').textContent='';});
