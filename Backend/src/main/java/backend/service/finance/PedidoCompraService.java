package backend.service.finance;

import backend.dto.finance.StatusCompraDTO;
import backend.model.finance.PedidoCompra;
import backend.model.finance.Movimentacao;
import backend.repository.finance.PedidoCompraRepository;
import backend.service.erp.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoCompraService {

    private final PedidoCompraRepository repository;
    private final ProdutoService produtoService;
    private final MovimentacaoService movimentacaoService; // Para o bônus financeiro

    public List<PedidoCompra> listarTodos() {
        return repository.findAll();
    }

    public List<StatusCompraDTO> obterStatusCompras() {
        return repository.obterContagemPorStatus();
    }

    @Transactional
    public PedidoCompra salvar(PedidoCompra pedido) {
        // Vincula o fornecedor diretamente a partir do produto selecionado caso venha nulo da tela
        if (pedido.getFornecedor() == null && pedido.getProduto() != null) {
            pedido.setFornecedor(pedido.getProduto().getFornecedor());
        }
        return repository.save(pedido);
    }

    @Transactional
    public PedidoCompra atualizarStatus(Long id, String novoStatus) {
        PedidoCompra pedido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido de compra não encontrado com ID: " + id));

        String statusAnterior = pedido.getStatus();
        pedido.setStatus(novoStatus);

        // 🔥 GATILHO VINCULATIVO AUTOMÁTICO
        // Se mudou de "Em Análise" para "Aprovado" ou "Recebido", injeta no estoque e gera despesa
        if (!statusAnterior.equalsIgnoreCase("Aprovado") && novoStatus.equalsIgnoreCase("Aprovado")) {
            
            System.out.println("[🔄 VÍNCULO AUTOMÁTICO] Pedido " + id + " APROVADO. Atualizando estoque de: " + pedido.getProduto().getDescricao());
            
            // 1. Alimenta o estoque e recalcula o custo médio automaticamente usando sua função nativa
            produtoService.atualizarCustoMedioEEstoque(
                    pedido.getProduto().getId(),
                    pedido.getQuantidade(),
                    pedido.getProduto().getPrecoCusto()
            );

            // 2. ⭐ EXTRA: Registra automaticamente a saída no módulo financeiro (Cards e Gráficos de linha vão subir!)
            Movimentacao financeiro = new Movimentacao();
            financeiro.setTipo("SAIDA");
            financeiro.setValor(pedido.getValorTotal());
            financeiro.setDescricao("Compra de Mercadoria - Pedido Nº " + pedido.getId() + " | Fornecedor: " + pedido.getFornecedor().getRazaoSocial());
            financeiro.setDataHora(LocalDateTime.now());
            movimentacaoService.registrar(financeiro);
        }

        return repository.save(pedido);
    }
}