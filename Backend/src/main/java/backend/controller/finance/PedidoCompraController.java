package backend.controller.finance;

import backend.model.finance.PedidoCompra;
import backend.repository.finance.PedidoCompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos-compra")
@CrossOrigin("*")
@RequiredArgsConstructor
public class PedidoCompraController {

    private final PedidoCompraRepository repository;

    @GetMapping
    public List<PedidoCompra> listarTodos() {
        // Retorna a lista para alimentar sua tabela do Angular
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<PedidoCompra> criarPedido(@RequestBody PedidoCompra pedido) {
        if (pedido.getValorTotal() == null && pedido.getProduto() != null) {
            pedido.setValorTotal(pedido.getProduto().getPrecoCusto().multiply(java.math.BigDecimal.valueOf(pedido.getQuantidade())));
        }
        return ResponseEntity.ok(repository.save(pedido));
    }
}