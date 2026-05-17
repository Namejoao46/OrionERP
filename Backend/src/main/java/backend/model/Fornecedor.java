package backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "FORNECEDORES")
@Data
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cnpj;
    private String razaoSocial;
    private String nomeFantasia;
    private String inscricaoEstadual;
    private String inscricaoMunicipal;
    private String cnaePrincipal;
    private Integer crt;

    private String logradouro;
    private String numero;
    private String bairro;
    private String cidade;
    private String uf;
    private String cep;

    private String email;
    private String telefone;
    private String chavePix;
    private Integer leadTime; 
    private Double limiteCredito;

    @Column(columnDefinition = "TEXT")
    private String observacoes;
}