package backend.repository.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import backend.model.finance.Movimentacao;
import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {
    List<Movimentacao> findAllByOrderByDataHoraDesc();
}