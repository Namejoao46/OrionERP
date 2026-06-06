package backend.model.fiscal;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import backend.model.auth.Colaborador;
import backend.model.erp.Fornecedor;
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
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "NOTAS_RECEBIMENTO")
public class NotaRecebimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 9)
    private String numeroNota;         

    @Column(length = 3)
    private String serie;          

    @Column(length = 44, unique = true)
    private String chaveAcesso;      

    private LocalDateTime dataEmissao; 
    private LocalDateTime dataEntrada; 
    private String naturezaOperacao;  

    @Column(nullable = false)
    private String status = "RASCUNHO";

    // --- 2. Fornecedor (Emitente) ---
    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    private String statusFornecedor; 
    private BigDecimal valorTotalProdutos; 
    private BigDecimal valorTotalNota;    
    private BigDecimal valorFrete;        
    private BigDecimal valorSeguro;        
    private BigDecimal valorDesconto;      
    private BigDecimal outrasDespesas;    

    // Impostos totais
    private BigDecimal baseCalculoIcms;
    private BigDecimal valorIcms;
    private BigDecimal valorSt;        
    private BigDecimal valorIpi;          
    private BigDecimal valorPis;          
    private BigDecimal valorCofins;      

    @OneToMany(mappedBy = "nota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemNotaRecebimento> itens = new ArrayList<>();

    @OneToMany(mappedBy = "nota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DuplicataNota> duplicatas = new ArrayList<>();

    private String formaPagamento; 

    // Auditoria
    @ManyToOne
    @JoinColumn(name = "colaborador_id")
    private Colaborador operador;

    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        if (this.dataEntrada == null) this.dataEntrada = LocalDateTime.now();
        if (this.status == null) this.status = "RASCUNHO";
    }
}