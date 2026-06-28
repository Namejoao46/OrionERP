package backend.repository.finance;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.model.finance.PedidoCompra;

public interface PedidoCompraRepository extends JpaRepository<PedidoCompra, Long> {
}