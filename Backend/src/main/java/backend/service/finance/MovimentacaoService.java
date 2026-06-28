package backend.service.finance;

import backend.model.finance.Movimentacao;
import backend.repository.finance.MovimentacaoRepository;
import backend.repository.finance.PedidoCompraRepository;
import backend.dto.finance.DashboardFinanceDTO;
import backend.dto.finance.DashboardGastosDTO;
import backend.dto.finance.EvolucaoComprasDTO;
import backend.dto.finance.StatusCompraDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimentacaoService {

    private final MovimentacaoRepository repository;
    private final PedidoCompraRepository pedidoCompraRepository;

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
        
        BigDecimal lucroLiquido = receitaTotal.subtract(despesaTotal);

        return new DashboardFinanceDTO(saldoCaixa, receitaTotal, despesaTotal, lucroLiquido);
    }

    public DashboardGastosDTO obterDadosDashboardGastos() {
        // 1. Total Comprado (Soma histórica de SAÍDAS)
        BigDecimal totalComprado = repository.somarPorTipo("SAIDA");

        // 2. Compras do Mês Atual (🔥 Atualizado: Agora sem parâmetros, direto via Firebird)
        BigDecimal comprasMes = repository.somarComprasDoMes();
        
        // 3. Contagem de Pedidos de Compra Pendentes
        Long pedidosPendentes = pedidoCompraRepository.count(); 

        // 4. Fornecedores Ativos
        Long proveedoresAtivos = 47L; 

        return new DashboardGastosDTO(totalComprado, comprasMes, pedidosPendentes, proveedoresAtivos);
    }

    // 🔥 Adicionado: Processa a evolução de compras revertendo para a ordem cronológica
    public List<EvolucaoComprasDTO> obterEvolucaoCompras() {
        List<Object[]> resultados = repository.buscarEvolucaoComprasNativa();
        
        List<EvolucaoComprasDTO> lista = resultados.stream().map(reg -> new EvolucaoComprasDTO(
            (String) reg[0],
            (BigDecimal) reg[1]
        )).collect(Collectors.toList());

        Collections.reverse(lista);
        return lista;
    }

    public List<StatusCompraDTO> obterStatusCompras() {
        return pedidoCompraRepository.obterContagemPorStatus();
    }
}