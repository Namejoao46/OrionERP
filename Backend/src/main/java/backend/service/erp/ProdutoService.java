package backend.service.erp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.dto.erp.ProdutoRequest;
import backend.model.erp.Fornecedor;
import backend.model.erp.Produto;
import backend.repository.erp.FornecedorRepository;
import backend.repository.erp.ProdutoRepository;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;
    private final FornecedorRepository fornecedorRepository;

    @Transactional(readOnly = true)
    public List<Produto> listarTodos(Long empresaId) {
        long startTime = System.nanoTime();
        log.info("[TRACKING-PRODUTO] [GET] Listando catálogo geral para Empresa ID: {}", empresaId);
        
        List<Produto> produtos = repository.findByFornecedor_Empresa_Id(empresaId);
        double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
        log.info("[TRACKING-PRODUTO] [SUCCESS] Itens retornados: {} | Tempo: {}ms", produtos.size(), String.format("%.2f", elapsedMs));
        return produtos;
    }

    @Transactional(readOnly = true)
    public List<Produto> listarAtivos(Long empresaId) {
        log.info("[TRACKING-PRODUTO] Filtrando produtos ATIVOS. Empresa ID: {}", empresaId);
        return repository.findByStatusAndFornecedor_Empresa_Id("ATIVO", empresaId);
    }

    @Transactional(readOnly = true)
    public List<Produto> buscarPorDescricao(String termo, Long empresaId) {
        log.info("[TRACKING-PRODUTO] Pesquisa de catálogo por string: '{}' | Empresa: {}", termo, empresaId);
        return repository.buscarPorDescricaoEMultiTenant(termo, empresaId);
    }

    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id, Long empresaId) {
        log.info("[TRACKING-PRODUTO] Buscando registro único por ID: {} | Empresa Contexto: {}", id, empresaId);
        if (id == null) {
            throw new IllegalArgumentException("O ID do produto fornecido não pode ser nulo.");
        }
        
        return repository.findById(id)
                .filter(p -> p.getFornecedor() != null && 
                             p.getFornecedor().getEmpresa() != null && 
                             p.getFornecedor().getEmpresa().getId().equals(empresaId))
                .orElseThrow(() -> new RuntimeException("Produto não localizado ou você não possui permissão de visualização para o ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Produto> listarPorFornecedor(Long fornecedorId, Long empresaId) {
        log.info("[TRACKING-PRODUTO] Listando produtos associados ao Fornecedor ID: {} | Empresa: {}", fornecedorId, empresaId);
        if (fornecedorId == null) {
            throw new IllegalArgumentException("O ID do fornecedor não pode ser nulo.");
        }
        return repository.findByFornecedorIdAndEmpresaId(fornecedorId, empresaId);
    }

    @Transactional
    public Produto cadastrar(ProdutoRequest req, Long empresaId) {
        long startTime = System.nanoTime();
        log.info("[TRACKING-PRODUTO] [CREATE] Tentando inserir novo produto na base de dados para Empresa: {}", empresaId);
        
        if (req == null) throw new IllegalArgumentException("A requisição não pode ser nula.");
        if (req.descricao() == null || req.descricao().isBlank()) throw new IllegalArgumentException("A descrição do produto é obrigatória.");
        if (req.ncm() == null || req.ncm().isBlank()) throw new IllegalArgumentException("O NCM do produto é obrigatório.");

        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            repository.findByCodigoBarrasAndFornecedor_Empresa_Id(req.codigoBarras().trim(), empresaId).ifPresent(existente -> {
                throw new IllegalArgumentException("Este código de barras já está cadastrado nesta empresa sob o produto: " + existente.getDescricao());
            });
        }

        Produto produto = new Produto();
        mapearRequest(produto, req, empresaId);
        
        if (req.precoVenda() == null || req.precoVenda().compareTo(BigDecimal.ZERO) == 0) {
            produto.setPrecoVenda(calcularPrecoVenda(produto));
        }
        
        Produto salvo = repository.save(produto);
        double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
        log.info("[TRACKING-PRODUTO] [SUCCESS] Produto cadastrado sob ID: {} | Tempo: {}ms", salvo.getId(), String.format("%.2f", elapsedMs));
        return salvo;
    }

    @Transactional
    public Produto editar(Long id, ProdutoRequest req, Long empresaId) {
        log.info("[TRACKING-PRODUTO] [UPDATE] Editando informações do Produto ID: {}", id);
        if (req == null) throw new IllegalArgumentException("A requisição não pode ser nula.");
        
        Produto produto = buscarPorId(id, empresaId);

        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            repository.findByCodigoBarrasAndFornecedor_Empresa_Id(req.codigoBarras().trim(), empresaId).ifPresent(existente -> {
                if (!existente.getId().equals(id)) {
                    throw new IllegalArgumentException("Este código de barras já está em uso por outro produto: " + existente.getDescricao());
                }
            });
        }

        mapearRequest(produto, req, empresaId);
        
        if (req.precoVenda() == null || req.precoVenda().compareTo(BigDecimal.ZERO) == 0) {
            produto.setPrecoVenda(calcularPrecoVenda(produto));
        } else {
            produto.setPrecoVenda(req.precoVenda());
        }
        
        return repository.save(produto);
    }

    @Transactional
    public Produto duplicar(Long id, Long empresaId) {
        log.info("[TRACKING-PRODUTO] Clonando estrutura cadastral do Produto ID: {}", id);
        Produto original = buscarPorId(id, empresaId);
        Produto copia = new Produto();

        copia.setFornecedor(original.getFornecedor());
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
    public Produto alterarStatus(Long id, String novoStatus, Long empresaId) {
        Produto produto = buscarPorId(id, empresaId);
        produto.setStatus(novoStatus);
        return repository.save(produto);
    }

    @Transactional
    public void atualizarCustoMedioEEstoque(Long produtoId, BigDecimal quantidadeEntrada, BigDecimal custoRealUnitario) {
        Produto produto = repository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não localizado para mutação de estoque: " + produtoId));
        
        Long empresaId = (produto.getFornecedor() != null && produto.getFornecedor().getEmpresa() != null) 
                ? produto.getFornecedor().getEmpresa().getId() 
                : null;

        if (empresaId == null) {
            throw new IllegalStateException("Falha crítica de segurança: Não foi possível determinar o Tenant para o produto ID: " + produtoId);
        }

        this.atualizarCustoMedioEEstoque(produtoId, quantidadeEntrada, custoRealUnitario, empresaId);
    }

    @Transactional
    public void atualizarCustoMedioEEstoque(Long produtoId, BigDecimal quantidadeEntrada, BigDecimal custoRealUnitario, Long empresaId) {
        Produto produto = buscarPorId(produtoId, empresaId);

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

    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    private void mapearRequest(Produto produto, ProdutoRequest req, Long empresaId) {
        if (req.fornecedorId() == null) {
            throw new IllegalArgumentException("Todo produto deve estar obrigatoriamente vinculado a um fornecedor.");
        }
        
        Fornecedor fornecedor = fornecedorRepository.findById(req.fornecedorId())
                .filter(f -> f.getEmpresa() != null && f.getEmpresa().getId().equals(empresaId))
                .orElseThrow(() -> new IllegalArgumentException("Fornecedor associado inválido ou fora do escopo da sua empresa ativa."));
                
        produto.setFornecedor(fornecedor);
        
        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            produto.setCodigoBarras(req.codigoBarras().trim());
        } else {
            produto.setCodigoBarras(null); 
        }
        
        produto.setDescricao(req.descricao());
        produto.setUnidadeMedida(req.unidadeMedida());
        produto.setCategoria(req.categoria());
        produto.setStatus(req.status() != null ? req.status() : "ATIVO");
        produto.setEstoqueAtual(req.estoqueAtual() != null ? req.estoqueAtual() : BigDecimal.ZERO);
        produto.setEstoqueMinimo(req.estoqueMinimo());
        produto.setEstoqueMaximo(req.estoqueMaximo());
        produto.setLocalizacaoFisica(req.localizacaoFisica());
        produto.setPrecoCusto(req.precoCusto());
        produto.setMargemLucro(req.margemLucro());
        if (req.precoVenda() != null) produto.setPrecoVenda(req.precoVenda());
        produto.setNcm(req.ncm());
        produto.setCest(req.cest());
        
        try {
            produto.setOrigemProduto(req.origemProduto() != null ? Integer.parseInt(req.origemProduto().trim()) : 0);
        } catch (NumberFormatException e) {
            produto.setOrigemProduto(0);
        }

        produto.setCstIcms(req.cstIcms());
        produto.setAliquotaIcms(req.aliquotaIcms());
        produto.setAliquotaPis(req.aliquotaPis());
        produto.setAliquotaCofins(req.aliquotaCofins());
    }

    private BigDecimal calcularPrecoVenda(Produto produto) {
        BigDecimal base = produto.getCustoMedio() != null ? produto.getCustoMedio() : produto.getPrecoCusto();
        if (base == null || produto.getMargemLucro() == null) {
            return produto.getPrecoVenda() != null ? produto.getPrecoVenda() : BigDecimal.ZERO;
        }
        BigDecimal factor = BigDecimal.ONE.add(produto.getMargemLucro().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        return base.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }
    
    @Transactional
    public void deletar(Long id, Long empresaId) {
        log.warn("[TRACKING-PRODUTO] [DELETE] Comando de destruição invocado para ID: {}", id);
        Produto produto = buscarPorId(id, empresaId);

        if (produto.getEstoqueAtual() != null && produto.getEstoqueAtual().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Impossível deletar o produto. Saldo físico em estoque positivo (" + produto.getEstoqueAtual() + " un).");
        }

        repository.delete(produto);
    }

    @Transactional(readOnly = true)
    public List<Produto> listarEstoqueBaixo(Long empresaId) {
        return repository.buscarEstoqueBaixoMultiTenant(empresaId);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPatrimonialEstoque(Long empresaId) {
        BigDecimal resultado = repository.calcularPatrimonioTotalBanco(empresaId);
        return resultado != null ? resultado.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
    }
}