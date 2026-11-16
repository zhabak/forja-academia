package com.academia.gym.service;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
/** Protege todas as rotas administrativas. O portal valida suas próprias sessões de aluno. */
@Component
public class ProtecaoApi extends OncePerRequestFilter {
 private final ConcurrentHashMap<String,Instant> sessoes=new ConcurrentHashMap<>();
 public String emitir(){sessoes.entrySet().removeIf(e->e.getValue().isBefore(Instant.now()));String t=Credenciais.token();sessoes.put(Credenciais.hash(t),Instant.now().plusSeconds(28800));return t;}
 protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String origem=req.getHeader("Origin");
  if(origem!=null){res.setHeader("Access-Control-Allow-Origin",origem);res.setHeader("Vary","Origin");res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization");res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");}
  if(req.getMethod().equals("OPTIONS")){res.setStatus(204);return;}
  String p=req.getServletPath();
  if(p.startsWith("/api/")&&!p.startsWith("/api/portal/")&&!p.equals("/api/sessao")){
   String h=req.getHeader("Authorization");Instant fim=h!=null&&h.startsWith("Bearer ")?sessoes.get(Credenciais.hash(h.substring(7))):null;
   if(fim==null||!fim.isAfter(Instant.now())){res.setStatus(401);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Entre novamente na gestão.\"}");return;}
  }
  chain.doFilter(req,res);
 }
}
