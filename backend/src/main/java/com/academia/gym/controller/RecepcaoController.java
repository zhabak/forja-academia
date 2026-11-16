package com.academia.gym.controller;
import com.academia.gym.repository.AlunoRepository;
import com.academia.gym.service.Credenciais;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;
/** Rota administrativa protegida: código aleatório de uso único, válido por 30 minutos. */
@RestController @RequestMapping("/api/alunos") @CrossOrigin(origins="*")
public class RecepcaoController {
 private final AlunoRepository alunos;
 public RecepcaoController(AlunoRepository a){alunos=a;}
 @PostMapping("/{id}/ativacao") public Map<String,String> gerar(@PathVariable Long id){var a=alunos.findById(id).orElseThrow(()->new IllegalArgumentException("Aluno não encontrado."));String codigo=Credenciais.token().substring(0,12);a.setAtivacaoUsadaEm(null);a.setAtivacaoHash(Credenciais.hash(codigo));a.setAtivacaoExpira(Instant.now().plusSeconds(1800));alunos.save(a);return Map.of("codigo",codigo,"mensagem","Uso único, válido por 30 minutos. Confirme a identidade antes de entregar ao aluno.");}

 /** Consulta administrativa: acompanha o uso sem expor o hash ou recuperar o código. */
 @GetMapping("/{id}/ativacao") public Map<String,String> status(@PathVariable Long id){
 var a=alunos.findById(id).orElseThrow(()->new IllegalArgumentException("Aluno não encontrado."));
 String estado=a.getAtivacaoUsadaEm()!=null?"USADO":a.getAtivacaoHash()==null?"SEM CODIGO":a.getAtivacaoExpira()!=null&&a.getAtivacaoExpira().isAfter(Instant.now())?"PENDENTE":"EXPIRADO";
 return Map.of("status",estado,"cpf",a.getCpf(),"nome",a.getNome(),"usadoEm",a.getAtivacaoUsadaEm()==null?"":a.getAtivacaoUsadaEm().toString());
 }
}
