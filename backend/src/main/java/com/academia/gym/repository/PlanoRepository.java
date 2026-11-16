/**
 * FORJA ACADEMIA — PlanoRepository
 * Interface Spring Data JPA: fornece operações de persistência sem implementar SQL manualmente.
 */
package com.academia.gym.repository;
import com.academia.gym.model.Plano;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PlanoRepository extends JpaRepository<Plano,Long> {}