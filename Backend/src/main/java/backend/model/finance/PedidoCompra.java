package backend.model.finance;

import backend.model.erp.Produto;
import backend.model.erp.Fornecedor;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "PEDIDOS_COMPRA")
public class PedidoCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "CLIENTE_FORNECEDOR", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "FORNECEDOR_ID")
    private Long fornecedorIdAux;

    @Column(nullable = false)
    private BigDecimal quantidade;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private String status = "Em Análise"; // Em Análise, Aprovado, Recebido, Cancelado

    @Column(name = "data_pedido")
    private LocalDateTime dataPedido = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (this.fornecedor != null) {
            this.fornecedorIdAux = this.fornecedor.getId();
        }
    }
}