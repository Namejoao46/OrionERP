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
public class VendaService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoService movimentacaoService;

    @Transactional
    public void registrarVendaDigital(Long produtoId, int quantidadeVendida) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new RuntimeException("Produto não localizado"));

        BigDecimal valorTotalItem = produto.getPrecoVenda().multiply(BigDecimal.valueOf(quantidadeVendida));

        BigDecimal estoqueAtual = produto.getEstoqueAtual() != null ? produto.getEstoqueAtual() : BigDecimal.ZERO;
        BigDecimal estoqueAtualizado = estoqueAtual.subtract(BigDecimal.valueOf(quantidadeVendida));
        
        if (estoqueAtualizado.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Estoque insuficiente para " + produto.getDescricao());
        }
        
        produto.setEstoqueAtual(estoqueAtualizado);
        produtoRepository.save(produto);

        // 3. GATILHO FINANCEIRO
        Movimentacao vendaFinanceira = new Movimentacao();
        vendaFinanceira.setDescricao("Venda realizada: " + quantidadeVendida + "x " + produto.getDescricao());
        vendaFinanceira.setValor(valorTotalItem);
        vendaFinanceira.setTipo("ENTRADA"); 
        vendaFinanceira.setCategoria("Vendas");
        vendaFinanceira.setMetodoPagamento("PIX");
        vendaFinanceira.setDataHora(LocalDateTime.now());

        movimentacaoService.registrar(vendaFinanceira);
    }
}