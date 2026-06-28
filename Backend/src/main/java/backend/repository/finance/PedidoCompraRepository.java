package backend.repository.finance;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import backend.dto.finance.StatusCompraDTO;
import backend.model.finance.PedidoCompra;

public interface PedidoCompraRepository extends JpaRepository<PedidoCompra, Long> {
    @Query("SELECT new backend.dto.finance.StatusCompraDTO(p.status, COUNT(p)) " +
           "FROM PedidoCompra p " +
           "GROUP BY p.status")
    List<StatusCompraDTO> obterContagemPorStatus();
}