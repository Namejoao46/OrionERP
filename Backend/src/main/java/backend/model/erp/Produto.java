package backend.model.erp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name = "PRODUTOS")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id", nullable = false) 
    private Fornecedor fornecedor;
    
    // Blindagem para aceitar EAN-13, DUN-14 e códigos estendidos de rascunho
    @Column(name = "codigo_barras", unique = true, length = 30)
    @Size(max = 30, message = "O código de barras não pode superar 30 caracteres.")
    private String codigoBarras;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Column(name = "unidade_medida")
    private String unidadeMedida;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "status", nullable = false)
    private String status = "ATIVO"; 

    @Column(name = "estoque_atual", nullable = false)
    private BigDecimal estoqueAtual = BigDecimal.ZERO;

    @Column(name = "estoque_minimo")
    private BigDecimal estoqueMinimo;

    @Column(name = "estoque_maximo")
    private BigDecimal estoqueMaximo;

    @Column(name = "localizacao_fisica")
    private String localizacaoFisica;

    @Column(name = "preco_custo")
    private BigDecimal precoCusto;

    @Column(name = "custo_medio")
    private BigDecimal custoMedio; 

    @Column(name = "margem_lucro")
    private BigDecimal margemLucro; 

    @Column(name = "preco_venda")
    private BigDecimal precoVenda;

    @Column(name = "ncm", length = 8)
    private String ncm;

    @Column(name = "cest", length = 7)
    private String cest;

    // Alterado para Integer para aceitar o 0, 1, 2 vindo do Front do OrionERP
    @Column(name = "origem_produto")
    private Integer origemProduto; 

    @Column(name = "cst_icms")
    private String cstIcms;       

    @Column(name = "aliquota_icms")
    private BigDecimal aliquotaIcms;

    @Column(name = "aliquota_pis")
    private BigDecimal aliquotaPis;

    @Column(name = "aliquota_cofins")
    private BigDecimal aliquotaCofins;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoFornecedor> fornecedores = new ArrayList<>();

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
        if (this.status == null) this.status = "ATIVO";
        if (this.estoqueAtual == null) this.estoqueAtual = BigDecimal.ZERO;
        // Fallback preventivo caso venha vazio do rascunho do front
        if (this.origemProduto == null) this.origemProduto = 0; 
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }
}