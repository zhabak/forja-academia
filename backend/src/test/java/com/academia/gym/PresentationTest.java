package com.academia.gym;
import com.academia.gym.model.*;
import com.academia.gym.repository.*;
import com.academia.gym.service.*;
import com.academia.gym.controller.MatriculaController;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import java.lang.reflect.*;
import java.time.LocalDate;
import java.util.*;

class PresentationTest {
    Aluno aluno; Plano plano; Matricula mat;
    List<Matricula> mats; List<Frequencia> historico;
    AlunoRepository alunos; MatriculaRepository matriculas; PlanoRepository planos;
    AcessoService acesso; AlunoService cadastro;
    @SuppressWarnings("unchecked")
    static <T> T proxy(Class<T> type, java.util.function.BiFunction<String,Object[],Object> fn) {
        return (T)Proxy.newProxyInstance(type.getClassLoader(),new Class[]{type},(p,m,a)->fn.apply(m.getName(),a));
    }
    static void id(Object o,long id) throws Exception { Field f=o.getClass().getDeclaredField("id"); f.setAccessible(true); f.set(o,id); }
    @BeforeEach void setup() throws Exception {
        aluno=new Aluno(); id(aluno,1); aluno.setNome("Teste"); aluno.setCpf("123"); aluno.setIdentificadorBiometrico("FACE:1");
        plano=new Plano(); id(plano,2); plano.setDuracaoMeses(1);
        mat=new Matricula(); id(mat,3); mat.setAluno(aluno); mat.setPlano(plano); mat.setDataInicio(LocalDate.now()); mat.setDataFim(LocalDate.now().plusMonths(1));
        mats=new ArrayList<>(List.of(mat)); historico=new ArrayList<>();
        alunos=proxy(AlunoRepository.class,(n,a)->switch(n){case "findById" -> Optional.of(aluno); case "findByIdentificadorBiometrico" -> "FACE:1".equals(a[0])?Optional.of(aluno):Optional.empty(); case "save" -> a[0]; case "existsByCpf" -> false; default -> throw new AssertionError(n);});
        matriculas=proxy(MatriculaRepository.class,(n,a)->switch(n){case "findByAlunoId","findAll" -> mats; case "findById" -> Optional.of(mat); case "save" -> a[0]; default -> throw new AssertionError(n);});
        planos=proxy(PlanoRepository.class,(n,a)->Optional.of(plano));
        FrequenciaRepository freq=proxy(FrequenciaRepository.class,(n,a)->{assertEquals("save",n); Frequencia f=(Frequencia)a[0]; assertNotNull(f.getAluno()); historico.add(f); return f;});
        acesso=new AcessoService(alunos,matriculas,freq); cadastro=new AlunoService(alunos);
    }
    boolean permitido(){return (boolean)acesso.verificar("FACE:1").get("autorizado");}
    @Test void quatroCenariosPreservamHistoricoEFacial(){
        assertTrue(permitido()); mat.setDataFim(LocalDate.now().minusDays(1)); assertFalse(permitido());
        mat.setDataFim(LocalDate.now().plusDays(5)); cadastro.cancelar(1L); assertFalse(permitido());
        cadastro.reativar(1L); assertTrue(permitido()); assertEquals(4,historico.size()); assertEquals("FACE:1",aluno.getIdentificadorBiometrico());
    }
    @Test void desconhecidaNaoPersiste(){assertEquals(false,acesso.verificar("OUTRA").get("autorizado")); assertEquals(false,acesso.verificar(null).get("autorizado")); assertTrue(historico.isEmpty());}
    @Test void canceladaNaoAutoriza(){mat.setStatus("CANCELADA");assertFalse(permitido());}
    @Test void futuraNaoAutoriza(){mat.setDataInicio(LocalDate.now().plusDays(1));assertFalse(permitido());}
    @Test void datasNulasNaoAutorizam(){mat.setDataFim(null);assertFalse(permitido());mat.setDataFim(LocalDate.now());mat.setDataInicio(null);assertFalse(permitido());}
    @Test void vencimentoHojeAutoriza(){mat.setDataFim(LocalDate.now());assertTrue(permitido());}
    @Test void planoInativoNaoAutoriza(){plano.setAtivo(false);assertFalse(permitido());}
    @Test void matriculaFuturaNaoOcultaVigente(){Matricula futura=new Matricula();futura.setPlano(plano);futura.setDataInicio(LocalDate.now().plusYears(1));futura.setDataFim(LocalDate.now().plusYears(2));mats.add(futura);assertTrue(permitido());}
    @Test void semMatriculaNaoAutoriza(){mats.clear();assertFalse(permitido());}
    @Test void atualizarNaoReativaNemMudaFace(){cadastro.cancelar(1L);Aluno dados=new Aluno();dados.setEmail("novo@teste.com");dados.setIdentificadorBiometrico("OUTRA");dados.setDataNascimento(LocalDate.of(2000,1,1));cadastro.atualizar(1L,dados);assertEquals("CANCELADO",aluno.getStatus());assertEquals("FACE:1",aluno.getIdentificadorBiometrico());assertEquals(dados.getDataNascimento(),aluno.getDataNascimento());}
    @Test void putAtualizaMesmaMatricula(){var c=new MatriculaController(matriculas,alunos,planos);var fim=LocalDate.now().plusDays(2);assertSame(mat,c.atualizar(3L,new MatriculaController.MatriculaRequest(1L,2L,LocalDate.now(),fim,null)));assertEquals(fim,mat.getDataFim());assertEquals(1,mats.size());}
    @Test void putPreservaStatusOmitido(){mat.setStatus("CANCELADA");new MatriculaController(matriculas,alunos,planos).atualizar(3L,new MatriculaController.MatriculaRequest(1L,2L,null,null,null));assertEquals("CANCELADA",mat.getStatus());}
    @Test void criarAceitaFimExplicito(){var fim=LocalDate.now().plusDays(3);var m=new MatriculaController(matriculas,alunos,planos).criar(new MatriculaController.MatriculaRequest(1L,2L,LocalDate.now(),fim,"ATIVA"));assertEquals(fim,m.getDataFim());}
    @Test void rejeitaIntervaloInvertido(){assertThrows(IllegalArgumentException.class,()->new MatriculaController(matriculas,alunos,planos).atualizar(3L,new MatriculaController.MatriculaRequest(1L,2L,LocalDate.now(),LocalDate.now().minusDays(1),null)));}
}
