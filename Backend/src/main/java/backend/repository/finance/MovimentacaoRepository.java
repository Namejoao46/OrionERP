package backend.repository.finance;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import backend.model.finance.Movimentacao;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    @Query("SELECT COALESCE(SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.valor ELSE -m.valor END), 0) FROM Movimentacao m")
    BigDecimal obterSaldoEmCaixa();

    @Query("SELECT COALESCE(SUM(m.valor), 0) FROM Movimentacao m WHERE m.tipo = :tipo")
    BigDecimal somarPorTipo(@Param("tipo") String tipo);

    @Query("SELECT COALESCE(SUM(m.valor), 0) FROM Movimentacao m WHERE m.tipo = 'SAIDA' AND m.dataHora >= :inicioMes")
    BigDecimal somarComprasDoMes(@Param("inicioMes") LocalDateTime inicioMes);

    // 🔥 Adicionado: Query nativa para agrupar as saídas (compras) dos últimos 6 meses
    @Query(value = "SELECT " +
           "CASE MONTH(m.data_hora) " +
           "  WHEN 1 THEN 'Jan' WHEN 2 THEN 'Fev' WHEN 3 THEN 'Mar' " +
           "  WHEN 4 THEN 'Abr' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Jun' " +
           "  WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Set' " +
           "  WHEN 10 THEN 'Out' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dez' END as mes, " +
           "COALESCE(SUM(m.valor), 0) as total " +
           "FROM movimentacao m " +
           "WHERE m.tipo = 'SAIDA' " +
           "GROUP BY YEAR(m.data_hora), MONTH(m.data_hora) " +
           "ORDER BY YEAR(m.data_hora) DESC, MONTH(m.data_hora) DESC " +
           "LIMIT 6", nativeQuery = true)
    List<Object[]> buscarEvolucaoComprasNativa();

    List<Movimentacao> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);
}