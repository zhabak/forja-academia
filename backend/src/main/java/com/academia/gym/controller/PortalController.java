package com.academia.gym.controller;
import com.academia.gym.model.*;
import com.academia.gym.repository.*;
import com.academia.gym.service.Credenciais;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.*;
import java.util.*;

/** Primeiro acesso, sessão individual e autorização de treino verificados pelo servidor. */
@RestController @RequestMapping("/api/portal") @CrossOrigin(origins="*")
public class PortalController {
 private final AlunoRepository alunos; private final MatriculaRepository mats;
 private final Map<String,java.util.ArrayDeque<Instant>> tentativas=new HashMap<>();
 public PortalController(AlunoRepository a,MatriculaRepository m){alunos=a;mats=m;}
 private String cpf(String c){return c==null?"":c.replaceAll("\\D","");}
 private Aluno procurar(String c){String n=cpf(c);if(n.length()!=11)throw new IllegalArgumentException("Informe um CPF com 11 dígitos.");return alunos.findAll().stream().filter(a->cpf(a.getCpf()).equals(n)).findFirst().orElseThrow(()->new IllegalArgumentException("Aluno não encontrado. Procure a recepção para cadastro."));}
 private void limitar(String c){String k=cpf(c);var q=tentativas.computeIfAbsent(k,x->new java.util.ArrayDeque<>());Instant agora=Instant.now();q.removeIf(t->t.isBefore(agora.minusSeconds(900)));if(q.size()>=10)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Muitas tentativas. Aguarde 15 minutos.");q.add(agora);}
 /** Descobre apenas a etapa de acesso, sem devolver os dados do cadastro. */
 @PostMapping("/identificar") public synchronized Map<String,String> identificar(@RequestBody Map<String,String> req){
 String n=cpf(req.get("cpf"));limitar(n);
 if(n.length()!=11)throw new IllegalArgumentException("Informe um CPF com 11 dígitos.");
 var encontrados=alunos.findAll().stream().filter(a->cpf(a.getCpf()).equals(n)).toList();
 if(encontrados.isEmpty())return Map.of("etapa","NAO_ENCONTRADO");
 if(encontrados.size()!=1)throw new IllegalArgumentException("Cadastro duplicado. Procure a recepção.");
 return Map.of("etapa",encontrados.get(0).getSenhaHash()==null?"CRIAR_SENHA":"SENHA");
 }
 public record Acesso(String cpf,String senha,String codigo){}
 @PostMapping("/entrar") public synchronized Map<String,Object> entrar(@RequestBody Acesso req){limitar(req.cpf());Aluno a=procurar(req.cpf());if(a.getSenhaHash()==null)throw new IllegalArgumentException("Primeiro acesso: solicite seu código à recepção e crie uma senha.");if(req.senha()==null||req.senha().length()>128||!Credenciais.confere(req.senha(),a.getSenhaHash()))throw new IllegalArgumentException("CPF ou senha incorretos.");return sessao(a);}
 @PostMapping("/ativar") public synchronized Map<String,Object> ativar(@RequestBody Acesso req){limitar(req.cpf());Aluno a=procurar(req.cpf());if(req.senha()==null||req.senha().length()<8||req.senha().length()>128)throw new IllegalArgumentException("Use uma senha de 8 a 128 caracteres.");if(req.codigo()==null||a.getAtivacaoHash()==null||a.getAtivacaoExpira()==null||!a.getAtivacaoExpira().isAfter(Instant.now())||!Credenciais.hash(req.codigo().trim()).equals(a.getAtivacaoHash()))throw new IllegalArgumentException("Código inválido ou expirado. Procure a recepção.");a.setAtivacaoUsadaEm(Instant.now());a.setSenhaHash(Credenciais.senha(req.senha()));a.setAtivacaoHash(null);a.setAtivacaoExpira(null);return sessao(a);}
 private Map<String,Object> sessao(Aluno a){String t=Credenciais.token();a.setSessaoHash(Credenciais.hash(t));a.setSessaoExpira(Instant.now().plusSeconds(28800));alunos.save(a);return Map.of("token",t);}
 private Aluno autenticado(String h){if(h==null||!h.startsWith("Bearer "))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);Aluno a=alunos.findBySessaoHash(Credenciais.hash(h.substring(7))).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));if(a.getSessaoExpira()==null||!a.getSessaoExpira().isAfter(Instant.now()))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);return a;}
 @GetMapping("/me") public Map<String,Object> me(@RequestHeader(value="Authorization",required=false) String h){Aluno a=autenticado(h);return Map.of("aluno",a,"matriculas",mats.findByAlunoId(a.getId()));}
 @GetMapping("/treino") public Map<String,Object> treino(@RequestHeader(value="Authorization",required=false) String h){Aluno a=autenticado(h);if(!"ATIVO".equals(a.getStatus()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Aluno cancelado. Entre em contato com a recepção.");if(mats.findByAlunoId(a.getId()).stream().noneMatch(m->m.vigenteEm(LocalDate.now())))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Plano sem vigência. Solicite a renovação na recepção.");return Map.of("autorizado",true);}
 @PostMapping("/sair") public void sair(@RequestHeader(value="Authorization",required=false) String h){Aluno a=autenticado(h);a.setSessaoHash(null);a.setSessaoExpira(null);alunos.save(a);}
}
