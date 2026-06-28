package backend.model.gestao;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeFantasia;

    @Column(unique = true, nullable = false)
    private String cnpj;

    private String plano; // Ex: 'Basico', 'Premium'

    @Column(nullable = false)
    private BigDecimal capitalMesAtual; // 🪙 Adicionado

    @Column(nullable = false)
    private BigDecimal capitalMesAnterior; // 🪙 Adicionado

    @Lob
    @Column(name = "logo", columnDefinition = "BLOB")
    private byte[] logo;
}