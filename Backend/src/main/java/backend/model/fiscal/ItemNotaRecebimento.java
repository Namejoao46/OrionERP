package backend.model.fiscal;

import java.math.BigDecimal;

import backend.model.erp.Produto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "ITENS_NOTA_RECEBIMENTO")
public class ItemNotaRecebimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nota_id", nullable = false)
    private NotaRecebimento nota;

    private String codigoProdutoFornecedor;
    private String descricaoNota;          
    private String ncm;
    private String cfop;
    private String unidadeComercial;        
    private String cst;                     

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;
    private BigDecimal quantidadeFaturada;  
    private BigDecimal quantidadeRecebida;  

    private BigDecimal valorUnitario;       
    private BigDecimal valorTotal;          
    private BigDecimal aliquotaIcms;
    private BigDecimal valorIcmsItem;
    private BigDecimal aliquotaIpi;
    private BigDecimal valorIpiItem;

    @Column(precision = 15, scale = 4)
    private BigDecimal custoRealUnitario;
}