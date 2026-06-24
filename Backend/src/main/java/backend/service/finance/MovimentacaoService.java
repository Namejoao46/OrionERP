package backend.service.finance;

import backend.model.finance.Movimentacao;
import backend.repository.finance.MovimentacaoRepository;
import backend.dto.finance.DashboardFinanceDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentacaoService {

    private final MovimentacaoRepository repository;

    @Transactional
    public Movimentacao registrar(Movimentacao movimentacao) {
        if (movimentacao.getDataHora() == null) {
            movimentacao.setDataHora(LocalDateTime.now());
        }
        System.out.println("[LOG FINANÇAS] Persistindo movimentação automática: " + movimentacao.getDescricao() + " | R$ " + movimentacao.getValor());
        return repository.save(movimentacao);
    }

    public List<Movimentacao> listarTodas() {
        return repository.findAll();
    }

    public DashboardFinanceDTO obterDadosDashboard() {
        BigDecimal saldoCaixa = repository.obterSaldoEmCaixa();
        BigDecimal receitaTotal = repository.somarPorTipo("ENTRADA");
        BigDecimal despesaTotal = repository.somarPorTipo("SAIDA");
        
        // Lucro líquido básico: Receitas - Despesas
        BigDecimal lucroLiquido = receitaTotal.subtract(despesaTotal);

        return new DashboardFinanceDTO(saldoCaixa, receitaTotal, despesaTotal, lucroLiquido);
    }
}