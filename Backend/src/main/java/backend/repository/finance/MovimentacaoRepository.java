package backend.repository.finance;

import backend.model.finance.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    @Query("SELECT COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.valor ELSE -m.valor END), 0) FROM Movimentacao m")
    BigDecimal obterSaldoEmCaixa();

    @Query("SELECT COALESCE(SUM(m.valor), 0) FROM Movimentacao m WHERE m.tipo = :tipo")
    BigDecimal somarPorTipo(String tipo);

    // Busca movimentações filtradas por um intervalo de tempo
    List<Movimentacao> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);
}