package backend.model.finance;

import backend.model.erp.Produto;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "PEDIDOS_COMPRA")
public class PedidoCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_fornecedor", nullable = false)
    private String clienteFornecedor;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    private Integer quantidade;
    
    @Column(name = "valor_total")
    private BigDecimal valorTotal;

    private String status; // APROVADO, EM_ANALISE, RECEBIDO, CANCELADO
    
    @Column(name = "data_pedido")
    private LocalDate dataPedido;

    @PrePersist
    protected void onCreate() {
        if (this.dataPedido == null) this.dataPedido = LocalDate.now();
        if (this.status == null) this.status = "EM_ANALISE";
    }
}