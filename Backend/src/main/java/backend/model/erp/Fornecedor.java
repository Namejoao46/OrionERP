package backend.model.erp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import backend.model.gestao.Empresa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "FORNECEDORES")
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔒 VÍNCULO MULTI-TENANT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "nomeFantasia", "cnpj", "plano", "capitalMesAtual", "capitalMesAnterior", "logo"})
    private Empresa empresa;

    @Column(nullable = false)
    private String cnpj;
    
    private String razaoSocial;
    private String nomeFantasia;
    private String inscricaoEstadual;
    private String inscricaoMunicipal;
    private String cnaePrincipal;
    private Integer crt;

    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;
    private String cep;
    private String cMun; 

    private String email;
    private String telefone;
    private String chavePix;
    private Integer leadTime; 
    private Double limiteCredito;

    @Lob
    @Column(columnDefinition = "BLOB SUB_TYPE TEXT")
    private String observacoes;

    @Lob
    @Column(name = "foto_fornecedor", columnDefinition = "BLOB SUB_TYPE TEXT")
    private String foto; 
}