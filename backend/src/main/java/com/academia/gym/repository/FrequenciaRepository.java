/**
 * FORJA ACADEMIA — FrequenciaRepository
 * Interface Spring Data JPA: fornece operações de persistência sem implementar SQL manualmente.
 */
package com.academia.gym.repository;
import com.academia.gym.model.Frequencia;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FrequenciaRepository extends JpaRepository<Frequencia,Long> {
    long countByAcessoAutorizadoTrue();
}