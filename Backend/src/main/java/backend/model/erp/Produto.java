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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "PRODUTOS")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String codigoBarras;

    @Column(nullable = false)
    private String descricao;

    private String unidadeMedida;
    private String categoria;

    @Column(nullable = false)
    private String status = "ATIVO"; 
    @Column(nullable = false)
    private BigDecimal estoqueAtual = BigDecimal.ZERO;

    private BigDecimal estoqueMinimo;
    private BigDecimal estoqueMaximo;
    private String localizacaoFisica;

    private BigDecimal precoCusto;
    private BigDecimal custoMedio; 
    private BigDecimal margemLucro; 
    private BigDecimal precoVenda;

    @Column(length = 8)
    private String ncm;

    @Column(length = 7)
    private String cest;

    private String origemProduto; 
    private String cstIcms;       
    private BigDecimal aliquotaIcms;
    private BigDecimal aliquotaPis;
    private BigDecimal aliquotaCofins;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoFornecedor> fornecedores = new ArrayList<>();

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
        if (this.status == null) this.status = "ATIVO";
        if (this.estoqueAtual == null) this.estoqueAtual = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }
}