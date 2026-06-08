package backend.model.erp;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "FORNECEDORES")
@Data
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
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
    private String cMun; // Código do município do IBGE (visto no XML)

    private String email;
    private String telefone;
    private String chavePix;
    private Integer leadTime; 
    private Double limiteCredito;

    // Correção para o Firebird: Usa BLOB SUB_TYPE TEXT para textos longos de observações
    @Lob
    @Column(columnDefinition = "BLOB SUB_TYPE TEXT")
    private String observacoes;

    // Correção para o Firebird: Mapeado perfeitamente para suportar strings Base64 pesadas de fotos
    @Lob
    @Column(name = "foto_fornecedor", columnDefinition = "BLOB SUB_TYPE TEXT")
    private String foto; 
}