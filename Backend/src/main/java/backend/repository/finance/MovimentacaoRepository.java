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

    // 🔒 MANTIDO: Filtro original de movimentações do mês
    @Query(value = "SELECT COALESCE(SUM(m.valor), 0) FROM movimentacoes m " +
                   "WHERE m.tipo = 'SAIDA' " +
                   "AND EXTRACT(MONTH FROM m.data_hora) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP) " +
                   "AND EXTRACT(YEAR FROM m.data_hora) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)", 
           nativeQuery = true)
    BigDecimal somarComprasDoMes();

    // 🔒 MANTIDO: Filtro original de evolução por saídas de movimentações
    @Query(value = "SELECT FIRST 6 " +
           "CASE EXTRACT(MONTH FROM m.data_hora) " +
           "  WHEN 1 THEN 'Jan' WHEN 2 THEN 'Fev' WHEN 3 THEN 'Mar' " +
           "  WHEN 4 THEN 'Abr' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Jun' " +
           "  WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Set' " +
           "  WHEN 10 THEN 'Out' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dez' END as mes, " +
           "COALESCE(SUM(m.valor), 0) as total " +
           "FROM movimentacoes m " +
           "WHERE m.tipo = 'SAIDA' " +
           "GROUP BY EXTRACT(YEAR FROM m.data_hora), EXTRACT(MONTH FROM m.data_hora) " +
           "ORDER BY EXTRACT(YEAR FROM m.data_hora) DESC, EXTRACT(MONTH FROM m.data_hora) DESC", nativeQuery = true)
    List<Object[]> buscarEvolucaoComprasNativa();

    List<Movimentacao> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);

    // =========================================================================
    // 🔥 NOVOS MÉTODOS: Focados em calcular direto da tabela PEDIDOS_COMPRA
    // =========================================================================

    // 🌟 Novo 1: Soma TOTAL histórica de todos os pedidos de compra feitos
    @Query(value = "SELECT COALESCE(SUM(p.valor_total), 0) FROM pedidos_compra p", nativeQuery = true)
    BigDecimal obterTotalHistoricoPedidos();

    // 🌟 Novo 2: Soma dos pedidos de compra do mês atual
    @Query(value = "SELECT COALESCE(SUM(p.valor_total), 0) FROM pedidos_compra p " +
                   "WHERE EXTRACT(MONTH FROM p.data_pedido) = EXTRACT(MONTH FROM CURRENT_TIMESTAMP) " +
                   "AND EXTRACT(YEAR FROM p.data_pedido) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)", 
           nativeQuery = true)
    BigDecimal somarPedidosDoMes();

    // 🌟 Novo 3: Gráfico de evolução mensal baseado na tabela de pedidos (Ideal para capturar os R$ 100 na hora)
    @Query(value = "SELECT FIRST 6 " +
           "CASE EXTRACT(MONTH FROM p.data_pedido) " +
           "  WHEN 1 THEN 'Jan' WHEN 2 THEN 'Fev' WHEN 3 THEN 'Mar' " +
           "  WHEN 4 THEN 'Abr' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Jun' " +
           "  WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Set' " +
           "  WHEN 10 THEN 'Out' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dez' END as mes, " +
           "COALESCE(SUM(p.valor_total), 0) as total " +
           "FROM pedidos_compra p " +
           "GROUP BY EXTRACT(YEAR FROM p.data_pedido), EXTRACT(MONTH FROM p.data_pedido) " +
           "ORDER BY EXTRACT(YEAR FROM p.data_pedido) DESC, EXTRACT(MONTH FROM p.data_pedido) DESC", nativeQuery = true)
    List<Object[]> buscarEvolucaoPedidosNativa();
}