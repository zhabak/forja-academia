const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const nodes={};for(const [,id] of html.matchAll(/id="([^"]+)"/g))nodes[id]={value:'',innerHTML:'',textContent:'',classList:{add(){},remove(){}},disabled:false};
const store=new Map();const calls=[];let db={alunos:[{id:1,nome:'Teste',cpf:'123',status:'ATIVO',identificadorBiometrico:'FACE:1'}],planos:[{id:2,nome:'Mensal',ativo:true,duracaoMeses:1,valor:100}],matriculas:[]};
let nextId=2, failMat=false;
const ctx=vm.createContext({console,Date,Float32Array,Number,setTimeout,clearTimeout,document:{getElementById:id=>{assert.ok(nodes[id],id);return nodes[id]},querySelectorAll:()=>[]},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},sessionStorage:{},alert:()=>{},navigator:{},fetch:async(url,opt)=>{
 const route=url.replace('http://localhost:8080/api',''),body=opt.body?JSON.parse(opt.body):null;calls.push({route,method:opt.method,body});let data;
 if(opt.method==='GET')data=db[route.slice(1)]||{};
 if(route==='/alunos'&&opt.method==='POST'){data={...body,id:nextId++,status:'ATIVO'};db.alunos.push(data);}
 if(route==='/matriculas'&&opt.method==='POST'){if(failMat)return{ok:false,status:400,text:async()=>JSON.stringify({message:'Falha simulada'})};data={...body,id:20,aluno:{id:body.alunoId},plano:db.planos[0],dataInicio:body.inicio,dataFim:'2099-01-01',status:'ATIVA'};db.matriculas.push(data);}
 if(route.startsWith('/matriculas/')&&opt.method==='PUT'){data=db.matriculas.find(m=>m.id===Number(route.split('/')[2]));Object.assign(data,body,{dataInicio:body.inicio});}
 if(route.endsWith('/cancelar')){db.alunos[0].status='CANCELADO';data=db.alunos[0];}
 if(route.endsWith('/reativar')){db.alunos[0].status='ATIVO';data=db.alunos[0];}
 if(route==='/acesso/verificar')data={autorizado:false,motivo:'Aluno inativo/cancelado'};
 return {ok:true,status:200,text:async()=>JSON.stringify(data||{})};
},faceapi:{LabeledFaceDescriptors:class{},FaceMatcher:class{findBestMatch(){return{label:'1'}}},TinyFaceDetectorOptions:class{},detectSingleFace:()=>({withFaceLandmarks:()=>({withFaceDescriptor:async()=>({descriptor:new Float32Array(128)})})})}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
(async()=>{
 for(const [,handler] of html.matchAll(/onclick="([a-zA-Z]+)\(/g))assert.equal(run('typeof '+handler),'function',handler);
 await run('loadPlanos()');assert.match(nodes.planoAluno.innerHTML,/Mensal/);assert.match(nodes.novoPlanoAluno.innerHTML,/Mensal/);
 nodes.nome.value='Novo';nodes.cpf.value='456';nodes.planoAluno.value='2';await run('salvarAlunoComPlano()');assert.equal(db.matriculas.length,1);assert.equal(db.alunos.length,2);
 const rows=nodes.alunosTabela.innerHTML.match(/<tr[^>]*>.*?<\/tr>/g);for(const row of rows)assert.equal((row.match(/<td>/g)||[]).length,8);
 await run('abrirEdicaoPlano(2)');nodes.fimPlano.value='2098-01-01';await run('salvarPlanoAluno()');assert.ok(calls.some(c=>c.route==='/matriculas/20'&&c.method==='PUT'));assert.equal(db.matriculas.length,1);
 db.matriculas.push({...db.matriculas[0],id:21});await run('simularPlanoVencido()');assert.ok(db.matriculas.every(m=>m.dataFim<run('hoje()')));assert.ok(db.matriculas.every(m=>m.dataInicio<=m.dataFim));
 await run('cancelar(1)');assert.equal(db.alunos[0].status,'CANCELADO');await run('reativar(1)');assert.equal(db.alunos[0].status,'ATIVO');
 store.set('gym_face_1',JSON.stringify(Array(128).fill(0)));db.alunos[0].status='CANCELADO';run('cameraPronta=async()=>({})');const start=calls.length;await run('autenticarRosto()');const facial=calls.slice(start);assert.ok(facial.some(c=>c.route==='/acesso/verificar'));assert.ok(!facial.some(c=>c.route.includes('biometria-facial')));assert.ok(store.has('gym_face_1'));
 run('limparFormularioAluno()');nodes.nome.value='Parcial';nodes.cpf.value='789';nodes.planoAluno.value='2';failMat=true;await run('salvarAlunoComPlano()');assert.ok(nodes.alunoId.value);const count=db.alunos.length;await run('salvarAlunoComPlano()');assert.equal(db.alunos.length,count);assert.match(nodes.alunoMsg.textContent,/atualizados/);
 console.log('PASS: handlers HTML, selects, cadastro, 8 colunas, PUT sem duplicar, vencimento de múltiplas matrículas, cancelar/reativar, facial sem recadastro, histórico local e recuperação de falha parcial.');
})().catch(e=>{console.error(e);process.exitCode=1});
