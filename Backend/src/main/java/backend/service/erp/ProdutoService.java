package backend.service.erp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.dto.erp.ProdutoRequest;
import backend.model.erp.Produto;
import backend.repository.erp.ProdutoRepository;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    public List<Produto> listarAtivos() {
        return repository.findByStatus("ATIVO");
    }

    public List<Produto> buscarPorDescricao(String termo) {
        return repository.buscarPorDescricao(termo);
    }

    public Produto buscarPorId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("O ID fornecido não pode ser nulo.");
        }
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com ID: " + id));
    }

    @Transactional
    public Produto cadastrar(ProdutoRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("A requisição não pode ser nula.");
        }
        if (req.descricao() == null || req.descricao().isBlank()) {
            throw new IllegalArgumentException("A descrição do produto é obrigatória.");
        }
        if (req.ncm() == null || req.ncm().isBlank()) {
            throw new IllegalArgumentException("O NCM do produto é obrigatório.");
        }

        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            repository.findByCodigoBarras(req.codigoBarras()).ifPresent(existente -> {
                throw new IllegalArgumentException(
                    "Este código de barras já está cadastrado no produto: " + existente.getDescricao()
                );
            });
        }

        Produto produto = mapearRequest(new Produto(), req);
        produto.setPrecoVenda(calcularPrecoVenda(produto));
        return repository.save(produto);
    }

    @Transactional
    public Produto editar(Long id, ProdutoRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("A requisição não pode ser nula.");
        }
        
        Produto produto = buscarPorId(id);

        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            repository.findByCodigoBarras(req.codigoBarras()).ifPresent(existente -> {
                if (!existente.getId().equals(id)) {
                    throw new IllegalArgumentException(
                        "Este código de barras já está cadastrado no produto: " + existente.getDescricao()
                    );
                }
            });
        }

        mapearRequest(produto, req);
        produto.setPrecoVenda(calcularPrecoVenda(produto));
        return repository.save(produto);
    }

    @Transactional
    public Produto duplicar(Long id) {
        Produto original = buscarPorId(id);
        Produto copia = new Produto();

        copia.setDescricao(original.getDescricao() + " (Cópia)");
        copia.setUnidadeMedida(original.getUnidadeMedida());
        copia.setCategoria(original.getCategoria());
        copia.setStatus("ATIVO");
        copia.setEstoqueAtual(BigDecimal.ZERO);
        copia.setEstoqueMinimo(original.getEstoqueMinimo());
        copia.setEstoqueMaximo(original.getEstoqueMaximo());
        copia.setPrecoCusto(original.getPrecoCusto());
        copia.setMargemLucro(original.getMargemLucro());
        copia.setNcm(original.getNcm());
        copia.setCest(original.getCest());
        copia.setOrigemProduto(original.getOrigemProduto());
        copia.setCstIcms(original.getCstIcms());
        copia.setAliquotaIcms(original.getAliquotaIcms());
        copia.setAliquotaPis(original.getAliquotaPis());
        copia.setAliquotaCofins(original.getAliquotaCofins());
        copia.setPrecoVenda(calcularPrecoVenda(copia));
        return repository.save(copia);
    }

    @Transactional
    public Produto alterarStatus(Long id, String novoStatus) {
        Produto produto = buscarPorId(id);
        produto.setStatus(novoStatus);
        return repository.save(produto);
    }

    @Transactional
    public void atualizarCustoMedioEEstoque(Long produtoId, BigDecimal quantidadeEntrada, BigDecimal custoRealUnitario) {
        Produto produto = buscarPorId(produtoId);

        BigDecimal estoqueAtual = produto.getEstoqueAtual() != null ? produto.getEstoqueAtual() : BigDecimal.ZERO;
        BigDecimal custoAtual   = produto.getCustoMedio()   != null ? produto.getCustoMedio()   : custoRealUnitario;
        BigDecimal totalAtual  = estoqueAtual.multiply(custoAtual);
        BigDecimal totalNovo   = quantidadeEntrada.multiply(custoRealUnitario);
        BigDecimal novoEstoque = estoqueAtual.add(quantidadeEntrada);

        BigDecimal novoCustoMedio = novoEstoque.compareTo(BigDecimal.ZERO) > 0
                ? totalAtual.add(totalNovo).divide(novoEstoque, 4, RoundingMode.HALF_UP)
                : custoRealUnitario;

        produto.setEstoqueAtual(novoEstoque);
        produto.setCustoMedio(novoCustoMedio);
        if (produto.getMargemLucro() != null) {
            produto.setPrecoVenda(calcularPrecoVenda(produto));
        }

        repository.save(produto);
    }

    private Produto mapearRequest(Produto produto, ProdutoRequest req) {
        produto.setCodigoBarras(req.codigoBarras());
        produto.setDescricao(req.descricao());
        produto.setUnidadeMedida(req.unidadeMedida());
        produto.setCategoria(req.categoria());
        produto.setStatus(req.status() != null ? req.status() : "ATIVO");
        produto.setEstoqueMinimo(req.estoqueMinimo());
        produto.setEstoqueMaximo(req.estoqueMaximo());
        produto.setLocalizacaoFisica(req.localizacaoFisica());
        produto.setPrecoCusto(req.precoCusto());
        produto.setMargemLucro(req.margemLucro());
        if (req.precoVenda() != null) produto.setPrecoVenda(req.precoVenda());
        produto.setNcm(req.ncm());
        produto.setCest(req.cest());
        produto.setOrigemProduto(req.origemProduto());
        produto.setCstIcms(req.cstIcms());
        produto.setAliquotaIcms(req.aliquotaIcms());
        produto.setAliquotaPis(req.aliquotaPis());
        produto.setAliquotaCofins(req.aliquotaCofins());
        return produto;
    }

    private BigDecimal calcularPrecoVenda(Produto produto) {
        BigDecimal base = produto.getCustoMedio() != null ? produto.getCustoMedio() : produto.getPrecoCusto();
        if (base == null || produto.getMargemLucro() == null) return produto.getPrecoVenda();

        BigDecimal fator = BigDecimal.ONE.add(
            produto.getMargemLucro().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );
        return base.multiply(fator).setScale(2, RoundingMode.HALF_UP);
    }
}