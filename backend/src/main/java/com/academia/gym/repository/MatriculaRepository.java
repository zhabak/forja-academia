/**
 * FORJA ACADEMIA — MatriculaRepository
 * Interface Spring Data JPA: fornece operações de persistência sem implementar SQL manualmente.
 */
package com.academia.gym.repository;
import com.academia.gym.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface MatriculaRepository extends JpaRepository<Matricula,Long> {
    java.util.List<Matricula> findByAlunoId(Long alunoId);
    Optional<Matricula> findTopByAlunoIdOrderByDataFimDesc(Long alunoId);
}