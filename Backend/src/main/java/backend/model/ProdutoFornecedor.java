package backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(
    name = "PRODUTO_FORNECEDORES",
    uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "cnpj_fornecedor", "codigo_fornecedor"})
)
public class ProdutoFornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(name = "cnpj_fornecedor", nullable = false, length = 14)
    private String cnpjFornecedor;

    private String nomeFornecedor;

    @Column(name = "codigo_fornecedor", nullable = false)
    private String codigoFornecedor; 

    private BigDecimal ultimoPreco;
    private LocalDate ultimaCompra;
}