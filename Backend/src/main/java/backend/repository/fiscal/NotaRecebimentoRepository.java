package backend.repository.fiscal;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.fiscal.NotaRecebimento;

@Repository
public interface NotaRecebimentoRepository extends JpaRepository<NotaRecebimento, Long> {

    Optional<NotaRecebimento> findByChaveAcesso(String chaveAcesso);

    boolean existsByChaveAcesso(String chaveAcesso);

    List<NotaRecebimento> findAllByOrderByDataEntradaDesc();

    List<NotaRecebimento> findByStatus(String status);
}