package com.academia.gym;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import com.academia.gym.controller.PortalController;
import com.academia.gym.service.Credenciais;
import com.academia.gym.model.*;
import com.academia.gym.repository.*;
import java.util.*;
import java.time.*;

/** Regressões de primeiro acesso e bloqueios do portal, sem banco real. */
class PortalTest {
 @Test void senhaComSalNaoFicaEmTexto(){String h=Credenciais.senha("senha-segura");assertNotEquals(h,Credenciais.senha("senha-segura"));assertTrue(Credenciais.confere("senha-segura",h));assertFalse(Credenciais.confere("errada",h));}
 @Test void ativacaoSessaoETreino() throws Exception {
 Aluno a=new Aluno();PresentationTest.id(a,1);a.setCpf("123.456.789-00");a.setNome("Teste");a.setAtivacaoHash(Credenciais.hash("codigo"));a.setAtivacaoExpira(Instant.now().plusSeconds(60));
 var ar=PresentationTest.proxy(AlunoRepository.class,(n,args)->switch(n){case "findAll" -> List.of(a);case "save" -> a;case "findBySessaoHash" -> Objects.equals(args[0],a.getSessaoHash())?Optional.of(a):Optional.empty();default -> throw new AssertionError(n);});
 Plano p=new Plano();Matricula m=new Matricula();m.setPlano(p);m.setAluno(a);m.setDataInicio(LocalDate.now().minusDays(1));m.setDataFim(LocalDate.now().plusDays(1));
 var mr=PresentationTest.proxy(MatriculaRepository.class,(n,args)->List.of(m));var c=new PortalController(ar,mr);
 assertThrows(IllegalArgumentException.class,()->c.ativar(new PortalController.Acesso("12345678900","senha1234","errado")));
 var sessao=c.ativar(new PortalController.Acesso("12345678900","senha1234","codigo"));String auth="Bearer "+sessao.get("token");assertNull(a.getAtivacaoHash());assertEquals(true,c.treino(auth).get("autorizado"));
 assertThrows(IllegalArgumentException.class,()->c.ativar(new PortalController.Acesso("12345678900","senha1234","codigo")));
 m.setDataFim(LocalDate.now().minusDays(1));assertThrows(org.springframework.web.server.ResponseStatusException.class,()->c.treino(auth));m.setDataFim(LocalDate.now().plusDays(1));a.setStatus("CANCELADO");assertThrows(org.springframework.web.server.ResponseStatusException.class,()->c.treino(auth));
 c.sair(auth);assertThrows(org.springframework.web.server.ResponseStatusException.class,()->c.me(auth));
 }
}
