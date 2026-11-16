package com.academia.gym.service;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.academia.gym.model.Aluno;

/** Exclusão definitiva: remove dependências primeiro, em uma única transação. */
@Service
public class ExclusaoAlunoService {
    private final EntityManager em;
    public ExclusaoAlunoService(EntityManager em) { this.em = em; }

    @Transactional
    public void excluir(Long id) {
        Aluno aluno = em.find(Aluno.class, id);
        if (aluno == null) throw new IllegalArgumentException("Aluno não encontrado.");
        em.createQuery("delete from Pagamento p where p.matricula.id in (select m.id from Matricula m where m.aluno.id = :id)").setParameter("id", id).executeUpdate();
        em.createQuery("delete from Frequencia f where f.aluno.id = :id").setParameter("id", id).executeUpdate();
        em.createQuery("delete from Matricula m where m.aluno.id = :id").setParameter("id", id).executeUpdate();
        em.remove(aluno);
    }
}
