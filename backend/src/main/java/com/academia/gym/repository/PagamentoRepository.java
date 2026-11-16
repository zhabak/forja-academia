/**
 * FORJA ACADEMIA — PagamentoRepository
 * Interface Spring Data JPA: fornece operações de persistência sem implementar SQL manualmente.
 */
package com.academia.gym.repository;
import com.academia.gym.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PagamentoRepository extends JpaRepository<Pagamento,Long> {
    List<Pagamento> findByStatus(String status);
}