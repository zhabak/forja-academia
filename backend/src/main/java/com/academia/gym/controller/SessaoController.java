package com.academia.gym.controller;
import com.academia.gym.service.ProtecaoApi;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.Map;
/** Login administrativo agora validado no servidor. Configure FORJA_ADMIN_SENHA fora da demonstração. */
@RestController @CrossOrigin(origins="*")
public class SessaoController {
 private final ProtecaoApi protecao; private final String senha; private int falhas=0; private long bloqueadoAte=0;
 public SessaoController(ProtecaoApi p,@Value("${FORJA_ADMIN_SENHA:admin123}") String s){protecao=p;senha=s;}
 @PostMapping("/api/sessao") public synchronized Map<String,String> entrar(@RequestBody Map<String,String> req){
 if(System.currentTimeMillis()<bloqueadoAte)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
 if(!"admin".equals(req.get("usuario"))||!senha.equals(req.get("senha"))){if(++falhas>=10){bloqueadoAte=System.currentTimeMillis()+900000;falhas=0;}throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Usuário ou senha incorretos.");}
 falhas=0;return Map.of("token",protecao.emitir());
 }
}
