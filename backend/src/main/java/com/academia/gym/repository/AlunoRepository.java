/**
 * FORJA ACADEMIA — AlunoRepository
 * Interface Spring Data JPA: fornece operações de persistência sem implementar SQL manualmente.
 */
package com.academia.gym.repository;
import com.academia.gym.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AlunoRepository extends JpaRepository<Aluno,Long> {
    Optional<Aluno> findByIdentificadorBiometrico(String identificadorBiometrico);
    Optional<Aluno> findBySessaoHash(String sessaoHash);
    boolean existsByCpf(String cpf);
}