package backend.controller.finance;

import backend.dto.finance.StatusCompraDTO;
import backend.model.finance.PedidoCompra;
import backend.service.finance.PedidoCompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos-compra")
@CrossOrigin("*")
@RequiredArgsConstructor
public class PedidoCompraController {

    private final PedidoCompraService service;

    @GetMapping
    public ResponseEntity<List<PedidoCompra>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/status")
    public ResponseEntity<List<StatusCompraDTO>> obterStatusCompras() {
        return ResponseEntity.ok(service.obterStatusCompras());
    }

    @PostMapping
    public ResponseEntity<PedidoCompra> criarPedido(@RequestBody PedidoCompra pedido) {
        if (pedido.getValorTotal() == null && pedido.getProduto() != null) {
            pedido.setValorTotal(pedido.getProduto().getPrecoCusto().multiply(java.math.BigDecimal.valueOf(pedido.getQuantidade())));
        }
        return ResponseEntity.ok(service.salvar(pedido));
    }
}