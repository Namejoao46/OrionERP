package backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "EMPRESAS")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeFantasia;

    @Column(unique = true, nullable = false)
    private String cnpj;

    private String plano; // Ex: 'Basico', 'Premium'
}