package backend.service.fiscal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;
import lombok.extern.slf4j.Slf4j;

import backend.model.erp.Fornecedor;
import backend.model.erp.Produto;
import backend.model.erp.ProdutoFornecedor;
import backend.model.fiscal.ItemNotaRecebimento;
import backend.model.gestao.Empresa;
import backend.repository.erp.FornecedorRepository;
import backend.repository.erp.ProdutoFornecedorRepository;
import backend.repository.erp.ProdutoRepository;
import backend.repository.gestao.EmpresaRepository;
import lombok.RequiredArgsConstructor;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotaRecebimentoProcessor {

    private final FornecedorRepository fornecedorRepository;
    private final EmpresaRepository empresaRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoFornecedorRepository produtoFornecedorRepository;
    private final FornecedorXmlService fornecedorXmlService;
    private final NotaRecebimentoParser parser;

    @SuppressWarnings("UseSpecificCatch")
    public Fornecedor processarFornecedor(Element emit, String[] statusOut, Long empresaId) {
        long startTime = System.nanoTime();
        String cnpj = parser.getTagValue("CNPJ", emit);
        log.info("[TRACKING-PROCESSOR] [INIT] Processando fornecedor do emitente. CNPJ Alvo: '{}' | Empresa Contexto: {}", cnpj, empresaId);
        
        try {
            if (empresaId == null || empresaId <= 0) {
                throw new IllegalStateException("Falha grave de escopo Multi-Tenant: O ID da empresa fornecido é inválido (" + empresaId + ").");
            }

            Optional<Fornecedor> existente = fornecedorRepository.findByCnpjAndEmpresaId(cnpj, empresaId);

            Fornecedor fXml = fornecedorXmlService.converterElementParaFornecedor(emit);
            Fornecedor fFinal = existente.orElse(new Fornecedor());
            statusOut[0] = existente.isPresent() ? "ATUALIZADO" : "NOVO";
            
            log.info("[TRACKING-PROCESSOR] Fornecedor identificado na base como: '{}'", statusOut[0]);

            fFinal.setCnpj(cnpj);
            fFinal.setRazaoSocial(fXml.getRazaoSocial());
            fFinal.setNomeFantasia(fXml.getNomeFantasia());
            fFinal.setInscricaoEstadual(fXml.getInscricaoEstadual());
            fFinal.setInscricaoMunicipal(fXml.getInscricaoMunicipal());
            fFinal.setCnaePrincipal(fXml.getCnaePrincipal());
            fFinal.setCrt(fXml.getCrt());
            fFinal.setLogradouro(fXml.getLogradouro());
            fFinal.setNumero(fXml.getNumero());
            fFinal.setComplemento(fXml.getComplemento());
            fFinal.setBairro(fXml.getBairro());
            fFinal.setCep(fXml.getCep());
            fFinal.setCidade(fXml.getCidade());
            fFinal.setUf(fXml.getUf());
            fFinal.setCMun(fXml.getCMun());
            fFinal.setTelefone(fXml.getTelefone());

            Empresa empresaLogada = empresaRepository.findById(empresaId)
                    .orElseThrow(() -> new IllegalStateException("Empresa de ID " + empresaId + " mapeada no cabeçalho não existe na base de dados."));
            fFinal.setEmpresa(empresaLogada);

            Fornecedor salvo = fornecedorRepository.save(fFinal);
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-PROCESSOR] [SUCCESS] Fornecedor '{}' (ID: {}) salvo com sucesso. Tempo: {}ms", 
                    salvo.getRazaoSocial(), salvo.getId(), String.format("%.2f", elapsedMs));
            
            return salvo;

        } catch (Exception e) {
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.error("[TRACKING-PROCESSOR] [ERROR] Falha ao processar/persistir dados do Fornecedor CNPJ: {}. Tempo: {}ms | Erro: {}", 
                    cnpj, String.format("%.2f", elapsedMs), e.getMessage(), e);
            throw e;
        }
    }

    public void inteligênciaVinculoDePara(ItemNotaRecebimento item, String cnpjFornecedor, Fornecedor fornecedor) {
        if (fornecedor == null || fornecedor.getEmpresa() == null) {
            throw new IllegalStateException("Não foi possível processar o De-Para: Fornecedor ou Empresa nulos na chamada legada.");
        }
        
        Long empresaId = fornecedor.getEmpresa().getId();
        
        this.inteligênciaVinculoDePara(item, cnpjFornecedor, fornecedor, empresaId);
    }

    public void inteligênciaVinculoDePara(ItemNotaRecebimento item, String cnpjFornecedor, Fornecedor fornecedor, Long empresaId) {
        String cProd = item.getCodigoProdutoFornecedor();
        log.info("[TRACKING-PROCESSOR] [DE-PARA] Executando busca de relacionamento para o SKU do Fornecedor: '{}' | Empresa Contexto: {}", cProd, empresaId);

        // 1. Tentativa por vínculo histórico direto
        Optional<ProdutoFornecedor> vinculoExistente = produtoFornecedorRepository
                .findByCnpjFornecedorAndCodigoFornecedor(cnpjFornecedor, cProd);

        if (vinculoExistente.isPresent()) {
            Produto p = vinculoExistente.get().getProduto();
            item.setProduto(p);
            log.info("[TRACKING-PROCESSOR] [DE-PARA-MATCH] Vínculo HISTÓRICO direto encontrado! Item Nota mapeado para o Produto ID: {} ('{}')", 
                    p.getId(), p.getDescricao());
            return;
        }

        // 2. Tentativa por Código de Barras (EAN / GTIN) aplicando isolamento por Empresa
        String ean = item.getNcm(); 
        if (ean != null && !ean.isBlank() && !ean.equalsIgnoreCase("SEM GTIN")) {
            String eanLimpo = ean.trim();
            
            // CORRIGIDO: Agora mapeia via relacionamento Fornecedor -> Empresa
            Optional<Produto> produtoPorEan = produtoRepository.findByCodigoBarrasAndFornecedor_Empresa_Id(eanLimpo, empresaId);
            if (produtoPorEan.isPresent()) {
                Produto p = produtoPorEan.get();
                item.setProduto(p);
                log.info("[TRACKING-PROCESSOR] [DE-PARA-MATCH] Vínculo por EAN/GTIN ('{}') efetuado! Vinculado ao Produto ID: {}", eanLimpo, p.getId());
                gravarVinculoDePara(fornecedor, cProd, p, item.getValorUnitario());
                return;
            }
        }

        // 3. Tentativa por correspondência de descrição exata dentro do tenant correto
        if (item.getDescricaoNota() != null && !item.getDescricaoNota().isBlank()) {
            String descricaoXml = item.getDescricaoNota().trim();
            
            List<Produto> produtosPorDescricao = produtoRepository.buscarPorDescricaoEMultiTenant(descricaoXml, empresaId);
            
            Optional<Produto> correspondenciaExata = produtosPorDescricao.stream()
                    .filter(p -> p.getDescricao() != null && p.getDescricao().trim().equalsIgnoreCase(descricaoXml))
                    .findFirst();

            if (correspondenciaExata.isPresent()) {
                Produto p = correspondenciaExata.get();
                item.setProduto(p);
                log.info("[TRACKING-PROCESSOR] [DE-PARA-MATCH] Vínculo por DESCRIÇÃO EXATA ('{}') efetuado! Produto ID: {}", descricaoXml, p.getId());
                gravarVinculoDePara(fornecedor, cProd, p, item.getValorUnitario());
                return;
            }
        }

        log.warn("[TRACKING-PROCESSOR] [DE-PARA-MISS] O item '{}' (SKU Forn: '{}') não encontrou nenhum vínculo automatizado. Ficará pendente de De-Para manual.", 
                item.getDescricaoNota(), cProd);
    }

    public void gravarVinculoDePara(Fornecedor fornecedor, String codigoFornecedor, Produto produto, BigDecimal ultimoPreco) {
        long startTime = System.nanoTime();
        if (fornecedor == null || codigoFornecedor == null || produto == null) {
            log.warn("[TRACKING-PROCESSOR] [VINCULO-NEGADO] Parâmetros nulos para gravação de tabela De-Para. Forn: {}, CodForn: {}, Prod: {}", 
                    fornecedor, codigoFornecedor, produto);
            return;
        }

        try {
            ProdutoFornecedor vinculo = produtoFornecedorRepository
                    .findByCnpjFornecedorAndCodigoFornecedor(fornecedor.getCnpj(), codigoFornecedor)
                    .orElse(new ProdutoFornecedor());

            vinculo.setProduto(produto);
            vinculo.setCnpjFornecedor(fornecedor.getCnpj());
            vinculo.setNomeFornecedor(fornecedor.getRazaoSocial());
            vinculo.setCodigoFornecedor(codigoFornecedor);
            vinculo.setUltimoPreco(ultimoPreco);
            vinculo.setUltimaCompra(LocalDate.now());
            
            produtoFornecedorRepository.save(vinculo);
            
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-PROCESSOR] [SUCCESS] Dicionário De-Para atualizado/salvo. Fornecedor: '{}' -> Produto Sistema: '{}' | Tempo: {}ms", 
                    fornecedor.getRazaoSocial(), produto.getDescricao(), String.format("%.2f", elapsedMs));
            
        } catch (Exception e) {
            log.error("[TRACKING-PROCESSOR] [ERROR] Falha técnica ao salvar registro de relacionamento na tabela 'ProdutoFornecedor'. Erro: {}", 
                    e.getMessage(), e);
        }
    }
}