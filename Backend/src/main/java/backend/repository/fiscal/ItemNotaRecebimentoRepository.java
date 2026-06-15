package backend.repository.fiscal;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import backend.model.fiscal.ItemNotaRecebimento;

public interface ItemNotaRecebimentoRepository extends JpaRepository<ItemNotaRecebimento, Long> {
    List<ItemNotaRecebimento> findByNotaId(Long notaId);
}