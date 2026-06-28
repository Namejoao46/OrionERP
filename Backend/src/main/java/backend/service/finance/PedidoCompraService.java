package backend.service.finance;

import backend.dto.finance.StatusCompraDTO;
import backend.model.finance.PedidoCompra;
import backend.repository.finance.PedidoCompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoCompraService {

    private final PedidoCompraRepository repository;

    public List<PedidoCompra> listarTodos() {
        return repository.findAll();
    }

    public List<StatusCompraDTO> obterStatusCompras() {
        return repository.obterContagemPorStatus();
    }

    public PedidoCompra salvar(PedidoCompra pedido) {
        return repository.save(pedido);
    }
}