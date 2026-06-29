package backend.service.fiscal;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import lombok.extern.slf4j.Slf4j; // 🔹 Utilizando SLF4J para logging profissional

import backend.dto.fiscal.NotaImportadaResponse;
import backend.dto.fiscal.NotaImportadaResponse.DuplicataResponse;
import backend.dto.fiscal.NotaImportadaResponse.FornecedorResumo;
import backend.dto.fiscal.NotaImportadaResponse.ItemImportadoResponse;
import backend.model.erp.Fornecedor;
import backend.model.erp.Produto;
import backend.model.fiscal.ItemNotaRecebimento;
import backend.model.fiscal.NotaRecebimento;
import backend.repository.auth.ColaboradorRepository;
import backend.repository.erp.ProdutoRepository;
import backend.repository.fiscal.ItemNotaRecebimentoRepository;
import backend.repository.fiscal.NotaRecebimentoRepository;
import backend.service.erp.ProdutoService;
import backend.service.finance.CompraService;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotaRecebimentoService {

    private final NotaRecebimentoRepository notaRepository;
    private final ItemNotaRecebimentoRepository itemRepository;
    private final ProdutoRepository produtoRepository;
    private final ColaboradorRepository colaboradorRepository;
    
    private final NotaRecebimentoParser parser;
    private final NotaRecebimentoProcessor processor;
    
    private final ProdutoService produtoService;
    private final CompraService compraService;

    @Transactional
    public NotaImportadaResponse importarXml(InputStream xmlInputStream) throws Exception {
        long startTime = System.nanoTime();
        log.info("[TRACKING-SERVICE] [INIT] Inicializando importação de XML via Contexto de Segurança.");
        
        try {
            String loginUsuarioLogado = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();
            
            var col = colaboradorRepository.findByLogin(loginUsuarioLogado)
                    .orElseThrow(() -> new IllegalStateException("Usuário logado '" + loginUsuarioLogado + "' não localizado no banco."));
            
            if (col.getEmpresa() == null) {
                throw new IllegalStateException("O usuário '" + loginUsuarioLogado + "' não possui empresa vinculada.");
            }
            
            log.info("[TRACKING-SERVICE] Usuário detectado: {} | Empresa ID: {}", loginUsuarioLogado, col.getEmpresa().getId());
            return importarXml(xmlInputStream, col.getEmpresa().getId());
            
        } catch (Exception e) {
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.error("[TRACKING-SERVICE] [CRITICAL-ERROR] Falha na validação do Contexto de Segurança. Tempo: {}ms | Erro: {}", 
                    String.format("%.2f", elapsedMs), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public NotaImportadaResponse importarXml(InputStream xmlInputStream, Long empresaId) throws Exception {
        long startTime = System.nanoTime();
        log.info("[TRACKING-SERVICE] [POST] Iniciando processamento do XML fiscal para a Empresa ID: {}", empresaId);
        
        try {
            // Parse estrutural do XML
            Document doc = parser.parsearXml(xmlInputStream);
            String chave = parser.extrairChave(doc);
            log.info("[TRACKING-SERVICE] [PARSING] Chave de Acesso identificada: {}", chave);

            // Verificação de Idempotência
            Optional<NotaRecebimento> notaExistente = notaRepository.findByChaveAcesso(chave);
            if (notaExistente.isPresent()) {
                double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
                log.warn("[TRACKING-SERVICE] [IDEMPOTÊNCIA] Nota Fiscal já processada anteriormente. Retornando dados salvos da Chave: {} | Tempo: {}ms", 
                        chave, String.format("%.2f", elapsedMs));
                return montarResposta(notaExistente.get());
            }

            NodeList infNFeList = doc.getElementsByTagNameNS("*", "infNFe");
            Element infNFe = infNFeList.getLength() > 0 ? (Element) infNFeList.item(0) : null;
            if (infNFe == null) throw new Exception("Tag <infNFe> obrigatória não foi localizada no XML.");

            NotaRecebimento nota = new NotaRecebimento();
            
            // 1. Dados Mestres
            Element ide = (Element) infNFe.getElementsByTagNameNS("*", "ide").item(0);
            parser.preencherDadosMestres(nota, ide, chave);
            log.info("[TRACKING-SERVICE] [PROCESS] Dados Mestres populados. Número: {} | Série: {}", nota.getNumeroNota(), nota.getSerie());

            // 2. Fornecedor
            Element emit = (Element) infNFe.getElementsByTagNameNS("*", "emit").item(0);
            String[] statusForn = new String[1];
            Fornecedor fornecedor = processor.processarFornecedor(emit, statusForn, empresaId);
            nota.setFornecedor(fornecedor);
            nota.setStatusFornecedor(statusForn[0]);
            log.info("[TRACKING-SERVICE] [PROCESS] Fornecedor resolvido: {} (CNPJ: {}) | Status: {}", 
                    fornecedor.getRazaoSocial(), fornecedor.getCnpj(), statusForn[0]);

            // 3. Totais
            Element total = (Element) infNFe.getElementsByTagNameNS("*", "total").item(0);
            Element icmsTot = total != null ? (Element) total.getElementsByTagNameNS("*", "ICMSTot").item(0) : null;
            parser.preencherTotais(nota, icmsTot);

            // 4. Itens e Vínculos
            NodeList detList = infNFe.getElementsByTagNameNS("*", "det");
            List<ItemNotaRecebimento> itens = new ArrayList<>();
            log.info("[TRACKING-SERVICE] [PROCESS] Processando loop de itens do XML. Total de itens detectados: {}", detList.getLength());
            
            for (int i = 0; i < detList.getLength(); i++) {
                Element det = (Element) detList.item(i);
                ItemNotaRecebimento item = parser.extrairItem(det, nota);
                
                // Tenta De-Para Inteligente
                processor.inteligênciaVinculoDePara(item, fornecedor.getCnpj(), fornecedor);
                itens.add(item);
            }
            nota.setItens(itens);

            // 5. Financeiro / Duplicatas
            Element cobr = (Element) infNFe.getElementsByTagNameNS("*", "cobr").item(0);
            if (cobr != null) {
                Element fat = (Element) cobr.getElementsByTagNameNS("*", "fat").item(0);
                if (fat != null) nota.setFormaPagamento(parser.resolverFormaPagamento(infNFe));
                nota.setDuplicatas(parser.extrairDuplicatas(cobr, nota));
                log.info("[TRACKING-SERVICE] [PROCESS] Dados de cobrança mapeados. Parcelas: {}", nota.getDuplicatas().size());
            }
            
            nota.setStatus("RASCUNHO");
            NotaRecebimento notaSalva = notaRepository.save(nota);
            
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-SERVICE] [SUCCESS] Nota persistida como RASCUNHO com sucesso. ID Interno: {} | Tempo total: {}ms", 
                    notaSalva.getId(), String.format("%.2f", elapsedMs));
            
            return montarResposta(notaSalva);
            
        } catch (Exception e) {
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.error("[TRACKING-SERVICE] [ERROR] Falha crítica ao processar e salvar XML. Tempo: {}ms | Mensagem: {}", 
                    String.format("%.2f", elapsedMs), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void vincularItem(Long itemId, Long produtoId) {
        long startTime = System.nanoTime();
        log.info("[TRACKING-SERVICE] [POST] Iniciando vinculação manual de item. ItemNotaID: {} -> ProdutoSistemaID: {}", itemId, produtoId);
        
        try {
            ItemNotaRecebimento item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item de nota de ID " + itemId + " não foi localizado."));
            Produto produto = produtoRepository.findById(produtoId)
                    .orElseThrow(() -> new RuntimeException("Produto do sistema de ID " + produtoId + " não foi localizado."));

            item.setProduto(produto);
            itemRepository.save(item);
            
            processor.gravarVinculoDePara(item.getNota().getFornecedor(), item.getCodigoProdutoFornecedor(), produto, item.getValorUnitario());
            
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-SERVICE] [SUCCESS] Vínculo manual gravado com sucesso. Tempo: {}ms", String.format("%.2f", elapsedMs));
            
        } catch (Exception e) {
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.error("[TRACKING-SERVICE] [ERROR] Falha ao tentar vincular Item ID: {} ao Produto ID: {}. Tempo: {}ms | Erro: {}", 
                    itemId, produtoId, String.format("%.2f", elapsedMs), e.getMessage());
            throw e;
        }
    }

    @Transactional
    @SuppressWarnings("UseSpecificCatch")
    public void confirmarEntrada(Long notaId) {
        long startTime = System.nanoTime();
        log.info("[TRACKING-SERVICE] [POST] REQUISIÇÃO CRÍTICA: Disparando consolidação física e financeira para Nota ID: {}", notaId);
        
        try {
            NotaRecebimento nota = notaRepository.findById(notaId)
                    .orElseThrow(() -> new RuntimeException("Nota de ID " + notaId + " não encontrada para fechamento."));
            
            if (!"RASCUNHO".equals(nota.getStatus())) {
                throw new IllegalStateException("Operação negada. Apenas notas com status RASCUNHO podem ser confirmadas. Status atual: " + nota.getStatus());
            }

            BigDecimal valorTotalProdutos = nota.getValorTotalProdutos() != null ? nota.getValorTotalProdutos() : BigDecimal.ONE;
            BigDecimal custosExtras = nvl(nota.getValorFrete()).add(nvl(nota.getValorSeguro()))
                    .add(nvl(nota.getOutrasDespesas())).subtract(nvl(nota.getValorDesconto()));

            log.info("[TRACKING-SERVICE] [CALCULATING] Calculando rateio de custos extras. Total assessório: BRL {}", custosExtras);

            for (ItemNotaRecebimento item : nota.getItens()) {
                if (item.getProduto() == null) {
                    log.warn("[TRACKING-SERVICE] [WARN] Item ID: {} não possui vínculo com produto do sistema. Pulando atualização de estoque.", item.getId());
                    continue;
                }
                
                BigDecimal qtd = item.getQuantidadeRecebida() != null ? item.getQuantidadeRecebida() : item.getQuantidadeFaturada();
                if (qtd == null || qtd.compareTo(BigDecimal.ZERO) <= 0) continue;

                BigDecimal proporcao = item.getValorTotal() != null && valorTotalProdutos.compareTo(BigDecimal.ZERO) > 0
                        ? item.getValorTotal().divide(valorTotalProdutos, 8, RoundingMode.HALF_UP) : BigDecimal.ZERO;

                BigDecimal valorTotalItem = nvl(item.getValorTotal()).add(custosExtras.multiply(proporcao));
                BigDecimal custoRealUnitario = valorTotalItem.divide(qtd, 4, RoundingMode.HALF_UP);
                
                item.setCustoRealUnitario(custoRealUnitario);
                itemRepository.save(item);

                // Dispara triggers nos submódulos externos
                produtoService.atualizarCustoMedioEEstoque(item.getProduto().getId(), qtd, custoRealUnitario);
                compraService.registrarCompraFornecedor(item.getProduto().getId(), qtd.intValue(), item.getValorUnitario());
                processor.gravarVinculoDePara(nota.getFornecedor(), item.getCodigoProdutoFornecedor(), item.getProduto(), item.getValorUnitario());
            }
            
            nota.setStatus("CONFIRMADO");
            notaRepository.save(nota);
            
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-SERVICE] [SUCCESS] Nota Fiscal ID: {} consolidada como CONFIRMADA. Estoque e Financeiro atualizados. Tempo: {}ms", 
                    notaId, String.format("%.2f", elapsedMs));
            
        } catch (Exception e) {
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.error("[TRACKING-SERVICE] [CRITICAL-ERROR] Falha no fechamento da Nota ID: {}. Transação sofrerá Rollback! Tempo: {}ms | Erro: {}", 
                    notaId, String.format("%.2f", elapsedMs), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    @SuppressWarnings("UseSpecificCatch")
    public void cancelar(Long notaId) {
        long startTime = System.nanoTime();
        log.warn("[TRACKING-SERVICE] [POST] Solicitando cancelamento da Nota ID: {}", notaId);
        
        try {
            NotaRecebimento nota = notaRepository.findById(notaId)
                    .orElseThrow(() -> new RuntimeException("Nota ID " + notaId + " não localizada para cancelamento."));
            
            if ("CONFIRMADO".equals(nota.getStatus())) {
                throw new IllegalStateException("Bloqueio de Regra: Uma nota já confirmada no estoque/financeiro não pode ser cancelada.");
            }
            
            nota.setStatus("CANCELADO");
            notaRepository.save(nota);
            
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-SERVICE] [SUCCESS] Nota ID: {} alterada para CANCELADO com sucesso. Tempo: {}ms", notaId, String.format("%.2f", elapsedMs));
            
        } catch (Exception e) {
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.error("[TRACKING-SERVICE] [ERROR] Falha ao cancelar Nota ID: {}. Tempo: {}ms | Erro: {}", 
                    notaId, String.format("%.2f", elapsedMs), e.getMessage());
            throw e;
        }
    }

    public List<NotaRecebimento> listarTodas() { 
        log.info("[TRACKING-SERVICE] [GET] Buscando listagem histórica ordenada de todas as Notas de Entrada.");
        return notaRepository.findAllByOrderByDataEntradaDesc(); 
    }
    
    public NotaRecebimento buscarPorId(Long id) { 
        log.info("[TRACKING-SERVICE] [GET] Buscando documento fiscal por ID único: {}", id);
        return notaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota de recebimento com ID " + id + " não encontrada.")); 
    }
    
    private BigDecimal nvl(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private NotaImportadaResponse montarResposta(NotaRecebimento nota) {
        Fornecedor f = nota.getFornecedor();
        if (f == null) return null;

        FornecedorResumo fornResumo = new FornecedorResumo(
                f.getId(), f.getCnpj(), f.getRazaoSocial(), f.getNomeFantasia(),
                f.getInscricaoEstadual(), f.getCidade(), f.getUf()
        );

        List<ItemImportadoResponse> itensResp = nota.getItens().stream().map(i ->
            new ItemImportadoResponse(
                i.getId(), i.getCodigoProdutoFornecedor(), i.getDescricaoNota(), i.getNcm(), i.getCfop(),
                i.getUnidadeComercial(), i.getCst(), i.getQuantidadeFaturada(), i.getQuantidadeRecebida(),
                i.getValorUnitario(), i.getValorTotal(), i.getAliquotaIcms(), i.getValorIcmsItem(),
                i.getAliquotaIpi(), i.getValorIpiItem(),
                i.getProduto() != null ? i.getProduto().getId() : null,
                i.getProduto() != null ? i.getProduto().getDescricao() : null
            )
        ).toList();

        List<DuplicataResponse> dupsResp = nota.getDuplicatas().stream().map(d ->
            new DuplicataResponse(d.getNumeroParcela(), d.getDataVencimento(), d.getValor())
        ).toList();

        return new NotaImportadaResponse(
                nota.getNumeroNota(), nota.getSerie(), nota.getChaveAcesso(),
                nota.getDataEmissao(), nota.getDataEntrada(), nota.getNaturezaOperacao(),
                fornResumo, nota.getStatusFornecedor(),
                nota.getValorTotalProdutos(), nota.getValorTotalNota(),
                nota.getValorFrete(), nota.getValorSeguro(),
                nota.getValorDesconto(), nota.getOutrasDespesas(),
                nota.getBaseCalculoIcms(), nota.getValorIcms(),
                nota.getValorSt(), nota.getValorIpi(),
                nota.getValorPis(), nota.getValorCofins(),
                itensResp, nota.getFormaPagamento(), dupsResp, nota.getId()
        );
    }
}