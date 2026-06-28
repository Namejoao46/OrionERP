package backend.model.erp;

import jakarta.persistence.*;
import lombok.Data;
import backend.model.gestao.Empresa;

@Entity
@Table(name = "FORNECEDORES")
@Data
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔒 VÍNCULO MULTI-TENANT: Cada fornecedor agora pertence estritamente a uma empresa
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false) // Removido o 'unique=true' global pois o mesmo CNPJ pode existir em empresas diferentes
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