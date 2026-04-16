package backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "MOVIMENTACOES")
@Data 
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;
    private BigDecimal valor;
    private LocalDateTime dataHora;
    private String tipo; 
    private String categoria;
    private String metodoPagamento;

    @ManyToOne
    @JoinColumn(name = "colaborador_id")
    private Colaborador responsavel;
    
    public void setTipo(String tipo) {
    this.tipo = tipo;
}

public void setDataHora(java.time.LocalDateTime dataHora) {
    this.dataHora = dataHora;
}
}