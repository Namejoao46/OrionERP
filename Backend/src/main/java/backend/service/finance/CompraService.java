package backend.service.finance;

import backend.model.finance.Movimentacao;
import backend.model.erp.Produto;
import backend.repository.erp.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoService movimentacaoService;

    @Transactional
    public void registrarCompraFornecedor(Long produtoId, int quantidadeComprada, BigDecimal precoCustoUnitario) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new RuntimeException("Produto não cadastrado"));

        // 1. Calcula o total gasto na reposição
        BigDecimal totalGasto = precoCustoUnitario.multiply(BigDecimal.valueOf(quantidadeComprada));

        // 2. 🌟 Corrigido: Trata o estoque como BigDecimal usando .add()
        BigDecimal estoqueAtual = produto.getEstoqueAtual() != null ? produto.getEstoqueAtual() : BigDecimal.ZERO;
        BigDecimal estoqueAtualizado = estoqueAtual.add(BigDecimal.valueOf(quantidadeComprada));
        
        produto.setEstoqueAtual(estoqueAtualizado);
        produtoRepository.save(produto);

        // 3. GATILHO FINANCEIRO
        Movimentacao despesaFinanceira = new Movimentacao();
        despesaFinanceira.setDescricao("Compra de estoque: " + produto.getDescricao());
        despesaFinanceira.setValor(totalGasto);
        despesaFinanceira.setTipo("SAIDA");
        despesaFinanceira.setCategoria("Gastos / Fornecedores");
        despesaFinanceira.setMetodoPagamento("Boleto");
        despesaFinanceira.setDataHora(LocalDateTime.now());

        movimentacaoService.registrar(despesaFinanceira);
    }
}