package backend.repository.fiscal;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import backend.model.fiscal.NotaRecebimento;

public interface NotaRecebimentoRepository extends JpaRepository<NotaRecebimento, Long> {

    Optional<NotaRecebimento> findByChaveAcesso(String chaveAcesso);

    boolean existsByChaveAcesso(String chaveAcesso);

    List<NotaRecebimento> findAllByOrderByDataEntradaDesc();

    List<NotaRecebimento> findByStatus(String status);

    // ADICIONE ESTE MÉTODO:
    @Modifying
    @Transactional
    void deleteByFornecedorId(Long fornecedorId);
}