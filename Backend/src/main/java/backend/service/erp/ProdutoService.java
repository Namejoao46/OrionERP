package backend.service.erp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.dto.erp.ProdutoRequest;
import backend.model.erp.Fornecedor;
import backend.model.erp.Produto;
import backend.repository.erp.FornecedorRepository;
import backend.repository.erp.ProdutoRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;
    private final FornecedorRepository fornecedorRepository;

    @Transactional(readOnly = true)
    public List<Produto> listarTodos() {
        System.out.println("[LOG PRODUTO-SERVICE] Listando todos os produtos.");
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Produto> listarAtivos() {
        System.out.println("[LOG PRODUTO-SERVICE] Listando produtos com status ATIVO.");
        return repository.findByStatus("ATIVO");
    }

    @Transactional(readOnly = true)
    public List<Produto> buscarPorDescricao(String termo) {
        System.out.println("[LOG PRODUTO-SERVICE] Buscando por descrição. Termo: " + termo);
        return repository.buscarPorDescricao(termo);
    }

    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        System.out.println("[LOG PRODUTO-SERVICE] Buscando produto por ID: " + id);
        if (id == null) {
            throw new IllegalArgumentException("O ID fornecido não pode ser nulo.");
        }
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com ID: " + id));
    }

    // 🔥 MELHORIA: Método essencial com transação ativa para ler dados e mapear o JSON sem quebrar no Firebird
    @Transactional(readOnly = true)
    public List<Produto> listarPorFornecedor(Long fornecedorId) {
        System.out.println("[LOG PRODUTO-SERVICE] Buscando produtos do fornecedor ID: " + fornecedorId);
        if (fornecedorId == null) {
            throw new IllegalArgumentException("O ID do fornecedor não pode ser nulo.");
        }
        return repository.findByFornecedorId(fornecedorId);
    }

    @Transactional
    public Produto cadastrar(ProdutoRequest req) {
        System.out.println("\n--- [LOG PRODUTO-SERVICE] Iniciando Cadastro de Produto ---");
        if (req == null) {
            throw new IllegalArgumentException("A requisição não pode ser nula.");
        }
        System.out.println("[LOG PRODUTO-SERVICE] Payload recebido -> Descrição: " + req.descricao() + " | Fornecedor ID: " + req.fornecedorId());

        if (req.descricao() == null || req.descricao().isBlank()) {
            throw new IllegalArgumentException("A descrição do produto é obrigatória.");
        }
        if (req.ncm() == null || req.ncm().isBlank()) {
            throw new IllegalArgumentException("O NCM do produto é obrigatório.");
        }

        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            System.out.println("[LOG PRODUTO-SERVICE] Validando unicidade do código de barras: " + req.codigoBarras());
            repository.findByCodigoBarras(req.codigoBarras()).ifPresent(existente -> {
                throw new IllegalArgumentException(
                    "Este código de barras já está cadastrado no produto: " + existente.getDescricao()
                );
            });
        }

        Produto produto = mapearRequest(new Produto(), req);
        produto.setPrecoVenda(calcularPrecoVenda(produto));
        
        System.out.println("[LOG PRODUTO-SERVICE] Salvando produto mapeado no banco...");
        Produto salvo = repository.save(produto);
        System.out.println("[LOG PRODUTO-SERVICE] Produto salvo com ID: " + salvo.getId());
        return salvo;
    }

    @Transactional
    public Produto editar(Long id, ProdutoRequest req) {
        System.out.println("\n--- [LOG PRODUTO-SERVICE] Iniciando Edição do Produto ID: " + id + " ---");
        if (req == null) {
            throw new IllegalArgumentException("A requisição não pode ser nula.");
        }
        
        Produto produto = buscarPorId(id);

        if (req.codigoBarras() != null && !req.codigoBarras().isBlank()) {
            System.out.println("[LOG PRODUTO-SERVICE] Verificando conflito de código de barras para edição...");
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
        
        System.out.println("[LOG PRODUTO-SERVICE] Persistindo alterações da edição...");
        return repository.save(produto);
    }

    @Transactional
    public Produto duplicar(Long id) {
        System.out.println("[LOG PRODUTO-SERVICE] Duplicando produto ID: " + id);
        Produto original = buscarPorId(id);
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
        
        System.out.println("[LOG PRODUTO-SERVICE] Criando cópia do produto com sucesso.");
        return repository.save(copia);
    }

    @Transactional
    public Produto alterarStatus(Long id, String novoStatus) {
        System.out.println("[LOG PRODUTO-SERVICE] Alterando status do produto ID " + id + " para " + novoStatus);
        Produto produto = buscarPorId(id);
        produto.setStatus(novoStatus);
        return repository.save(produto);
    }

    @Transactional
    public void atualizarCustoMedioEEstoque(Long produtoId, BigDecimal quantidadeEntrada, BigDecimal custoRealUnitario) {
        System.out.println("[LOG PRODUTO-SERVICE] Atualizando Custo Médio. Produto ID: " + produtoId);
        Produto produto = buscarPorId(produtoId);

        BigDecimal estoqueAtual = produto.getEstoqueAtual() != null ? produto.getEstoqueAtual() : BigDecimal.ZERO;
        BigDecimal custoAtual   = produto.getCustoMedio()   != null ? produto.getCustoMedio()   : custoRealUnitario;
        BigDecimal totalAtual  = estoqueAtual.multiply(custoAtual);
        BigDecimal totalNovo   = quantidadeEntrada.multiply(custoRealUnitario);
        BigDecimal novoEstoque = estoqueAtual.add(quantidadeEntrada);

        BigDecimal novoCustoMedio = novoEstoque.compareTo(BigDecimal.ZERO) > 0
                ? totalAtual.add(totalNovo).divide(novoEstoque, 4, RoundingMode.HALF_UP)
                : custoRealUnitario;

        System.out.println("[LOG PRODUTO-SERVICE] Estoque Antigo: " + estoqueAtual + " | Novo Estoque: " + novoEstoque);
        System.out.println("[LOG PRODUTO-SERVICE] Custo Médio Calculado: " + novoCustoMedio);

        produto.setEstoqueAtual(novoEstoque);
        produto.setCustoMedio(novoCustoMedio);
        if (produto.getMargemLucro() != null) {
            produto.setPrecoVenda(calcularPrecoVenda(produto));
        }

        repository.save(produto);
    }

    @SuppressWarnings("UnnecessaryTemporaryOnConversionFromString")
    private Produto mapearRequest(Produto produto, ProdutoRequest req) {
        System.out.println("[LOG PRODUTO-SERVICE] Vinculando e mapeando ProdutoRequest para a Entidade...");
        if (req.fornecedorId() == null) {
            throw new IllegalArgumentException("Todo produto deve estar obrigatoriamente vinculado a um fornecedor.");
        }
        
        Fornecedor fornecedor = fornecedorRepository.findById(req.fornecedorId())
                .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado com o ID informado."));
                
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
        produto.setEstoqueMinimo(req.estoqueMinimo());
        produto.setEstoqueMaximo(req.estoqueMaximo());
        produto.setLocalizacaoFisica(req.localizacaoFisica());
        produto.setPrecoCusto(req.precoCusto());
        produto.setMargemLucro(req.margemLucro());
        if (req.precoVenda() != null) produto.setPrecoVenda(req.precoVenda());
        produto.setNcm(req.ncm());
        produto.setCest(req.cest());
        
        if (req.origemProduto() != null && !req.origemProduto().isBlank()) {
            try {
                produto.setOrigemProduto(Integer.parseInt(req.origemProduto().trim()));
            } catch (NumberFormatException e) {
                System.out.println("[LOG PRODUTO-SERVICE] Erro ao converter origem '" + req.origemProduto() + "' para número. Definindo como 0.");
                produto.setOrigemProduto(0);
            }
        } else {
            produto.setOrigemProduto(0);
        }

        produto.setCstIcms(req.cstIcms());
        produto.setAliquotaIcms(req.aliquotaIcms());
        produto.setAliquotaPis(req.aliquotaPis());
        produto.setAliquotaCofins(req.aliquotaCofins());
        return produto;
    }

    private BigDecimal calcularPrecoVenda(Produto produto) {
        BigDecimal base = produto.getCustoMedio() != null ? produto.getCustoMedio() : produto.getPrecoCusto();
        if (base == null || produto.getMargemLucro() == null) {
            System.out.println("[LOG PRODUTO-SERVICE] Custo ou margem nulos. Mantendo preço de venda original.");
            return produto.getPrecoVenda() != null ? produto.getPrecoVenda() : BigDecimal.ZERO;
        }

        BigDecimal factor = BigDecimal.ONE.add(
            produto.getMargemLucro().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );
        BigDecimal precoCalculado = base.multiply(factor).setScale(2, RoundingMode.HALF_UP);
        System.out.println("[LOG PRODUTO-SERVICE] Preço de venda calculado automaticamente: " + precoCalculado);
        return precoCalculado;
    }
}