package backend.service.fiscal;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import backend.dto.fiscal.NotaImportadaResponse;
import backend.dto.fiscal.NotaImportadaResponse.DuplicataResponse;
import backend.dto.fiscal.NotaImportadaResponse.FornecedorResumo;
import backend.dto.fiscal.NotaImportadaResponse.ItemImportadoResponse;
import backend.model.erp.Fornecedor;
import backend.model.erp.Produto;
import backend.model.erp.ProdutoFornecedor;
import backend.model.fiscal.DuplicataNota;
import backend.model.fiscal.ItemNotaRecebimento;
import backend.model.fiscal.NotaRecebimento;
import backend.repository.erp.FornecedorRepository;
import backend.repository.erp.ProdutoFornecedorRepository;
import backend.repository.erp.ProdutoRepository;
import backend.repository.fiscal.ItemNotaRecebimentoRepository;
import backend.repository.fiscal.NotaRecebimentoRepository;
import backend.service.erp.ProdutoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotaRecebimentoService {

    // Modificadores 'final' adicionados e '@Autowired' removidos
    private final NotaRecebimentoRepository notaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoFornecedorRepository produtoFornecedorRepository;
    private final ItemNotaRecebimentoRepository itemRepository;
    private final ProdutoService produtoService;
    private final FornecedorXmlService fornecedorXmlService;

    private static final DateTimeFormatter DT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional
    public NotaImportadaResponse importarXml(InputStream xmlInputStream) throws Exception {
        System.out.println("[LOG NOTA-RECEBIMENTO] Iniciando parseamento do XML da Nota.");
        Document doc = parsearXml(xmlInputStream);
        
        String chave = getTagValue("chNFe", doc.getDocumentElement());
        if (chave == null || chave.isBlank()) {
            // Caso a tag chNFe esteja dentro de infNFe como atributo Id
            NodeList infNFeList = doc.getElementsByTagNameNS("*", "infNFe");
            Element infNFeAttr = infNFeList.getLength() > 0 ? (Element) infNFeList.item(0) : null;
            if (infNFeAttr != null && infNFeAttr.hasAttribute("Id")) {
                chave = infNFeAttr.getAttribute("Id").replace("NFe", "");
            }
        }

        System.out.println("[LOG NOTA-RECEBIMENTO] Chave de acesso identificada: " + chave);
        if (chave != null && !chave.isBlank() && notaRepository.existsByChaveAcesso(chave)) {
            throw new IllegalStateException("Esta NF-e (chave " + chave + ") já foi importada anteriormente.");
        }

        NodeList infNFeList = doc.getElementsByTagNameNS("*", "infNFe");
        Element infNFe = infNFeList.getLength() > 0 ? (Element) infNFeList.item(0) : null;
        if (infNFe == null) throw new Exception("Tag <infNFe> não encontrada. Verifique se o XML é uma NF-e válida.");

        NotaRecebimento nota = new NotaRecebimento();
        Element ide = (Element) infNFe.getElementsByTagNameNS("*", "ide").item(0);
        nota.setNumeroNota(getTagValue("nNF", ide));
        nota.setSerie(getTagValue("serie", ide));
        nota.setChaveAcesso(chave);
        nota.setNaturezaOperacao(getTagValue("natOp", ide));

        String dhEmi = getTagValue("dhEmi", ide);
        if (dhEmi != null && !dhEmi.isBlank()) {
            nota.setDataEmissao(LocalDateTime.parse(dhEmi, DT_FORMATTER));
        }
        nota.setDataEntrada(LocalDateTime.now());

        Element emit = (Element) infNFe.getElementsByTagNameNS("*", "emit").item(0);
        String[] statusForn = new String[1];
        
        Fornecedor fornecedor = processarFornecedorUnificado(emit, statusForn);
        nota.setFornecedor(fornecedor);
        nota.setStatusFornecedor(statusForn[0]);

        Element total = (Element) infNFe.getElementsByTagNameNS("*", "total").item(0);
        Element icmsTot = total != null ? (Element) total.getElementsByTagNameNS("*", "ICMSTot").item(0) : null;
        if (icmsTot != null) {
            nota.setValorTotalProdutos(parseBigDecimal(getTagValue("vProd", icmsTot)));
            nota.setValorTotalNota(parseBigDecimal(getTagValue("vNF", icmsTot)));
            nota.setValorFrete(parseBigDecimal(getTagValue("vFrete", icmsTot)));
            nota.setValorSeguro(parseBigDecimal(getTagValue("vSeg", icmsTot)));
            nota.setValorDesconto(parseBigDecimal(getTagValue("vDesc", icmsTot)));
            nota.setOutrasDespesas(parseBigDecimal(getTagValue("vOutro", icmsTot)));
            nota.setBaseCalculoIcms(parseBigDecimal(getTagValue("vBC", icmsTot)));
            nota.setValorIcms(parseBigDecimal(getTagValue("vICMS", icmsTot)));
            nota.setValorSt(parseBigDecimal(getTagValue("vST", icmsTot)));
            nota.setValorIpi(parseBigDecimal(getTagValue("vIPI", icmsTot)));
            nota.setValorPis(parseBigDecimal(getTagValue("vPIS", icmsTot)));
            nota.setValorCofins(parseBigDecimal(getTagValue("vCOFINS", icmsTot)));
        }

        NodeList detList = infNFe.getElementsByTagNameNS("*", "det");
        List<ItemNotaRecebimento> itens = new ArrayList<>();
        System.out.println("[LOG NOTA-RECEBIMENTO] Detectados " + detList.getLength() + " itens no XML.");
        for (int i = 0; i < detList.getLength(); i++) {
            Element det = (Element) detList.item(i);
            ItemNotaRecebimento item = processarItem(det, nota, fornecedor.getCnpj());
            itens.add(item);
        }
        nota.setItens(itens);

        Element cobr = (Element) infNFe.getElementsByTagNameNS("*", "cobr").item(0);
        List<DuplicataNota> duplicatas = new ArrayList<>();
        if (cobr != null) {
            Element fat = (Element) cobr.getElementsByTagNameNS("*", "fat").item(0);
            if (fat != null) {
                nota.setFormaPagamento(resolverFormaPagamento(infNFe));
            }
            NodeList dupList = cobr.getElementsByTagNameNS("*", "dup");
            for (int i = 0; i < dupList.getLength(); i++) {
                Element dup = (Element) dupList.item(i);
                DuplicataNota d = new DuplicataNota();
                d.setNota(nota);
                d.setNumeroParcela(getTagValue("nDup", dup));
                String venc = getTagValue("dVenc", dup);
                if (venc != null && !venc.isBlank()) {
                    d.setDataVencimento(LocalDate.parse(venc, DATE_FORMATTER));
                }
                d.setValor(parseBigDecimal(getTagValue("vDup", dup)));
                duplicatas.add(d);
            }
        }
        nota.setDuplicatas(duplicatas);
        nota.setStatus("RASCUNHO");

        System.out.println("[LOG NOTA-RECEBIMENTO] Salvando Nota Fiscal temporária no banco de dados.");
        NotaRecebimento notaSalva = notaRepository.save(nota);

        return montarResposta(notaSalva);
    }

    private Fornecedor processarFornecedorUnificado(Element emit, String[] statusOut) {
        String cnpj = getTagValue("CNPJ", emit);
        System.out.println("[LOG NOTA-RECEBIMENTO] Processando emitente CNPJ: " + cnpj);
        Optional<Fornecedor> existente = fornecedorRepository.findByCnpj(cnpj);

        Fornecedor fXml = fornecedorXmlService.converterElementParaFornecedor(emit);
        
        Fornecedor fFinal = existente.orElse(new Fornecedor());
        statusOut[0] = existente.isPresent() ? "ATUALIZADO" : "NOVO";

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

        return fornecedorRepository.save(fFinal);
    }
    
    private ItemNotaRecebimento processarItem(Element det, NotaRecebimento nota, String cnpjFornecedor) {
        Element prod = (Element) det.getElementsByTagNameNS("*", "prod").item(0);
        Element imposto = (Element) det.getElementsByTagNameNS("*", "imposto").item(0);

        ItemNotaRecebimento item = new ItemNotaRecebimento();
        item.setNota(nota);

        String cProd = getTagValue("cProd", prod);
        item.setCodigoProdutoFornecedor(cProd);
        item.setDescricaoNota(getTagValue("xProd", prod));
        item.setNcm(getTagValue("NCM", prod));
        item.setCfop(getTagValue("CFOP", prod));
        item.setUnidadeComercial(getTagValue("uCom", prod));
        item.setQuantidadeFaturada(parseBigDecimal(getTagValue("qCom", prod)));
        item.setQuantidadeRecebida(item.getQuantidadeFaturada()); 
        item.setValorUnitario(parseBigDecimal(getTagValue("vUnCom", prod)));
        item.setValorTotal(parseBigDecimal(getTagValue("vProd", prod)));

        if (imposto != null) {
            Element icms = primeiroFilho(imposto, "ICMS");
            if (icms != null) {
                Element icmsGrupo = obterPrimeiroElementoFilho(icms);
                if (icmsGrupo != null) {
                    item.setCst(getTagValue("CST", icmsGrupo));
                    if (item.getCst() == null || item.getCst().isBlank()) {
                        item.setCst(getTagValue("CSOSN", icmsGrupo));
                    }
                    item.setAliquotaIcms(parseBigDecimal(getTagValue("pICMS", icmsGrupo)));
                    item.setValorIcmsItem(parseBigDecimal(getTagValue("vICMS", icmsGrupo)));
                }
            }
            Element ipi = primeiroFilho(imposto, "IPI");
            if (ipi != null) {
                Element ipiGrupo = primeiroFilho(ipi, "IPITrib");
                if (ipiGrupo != null) {
                    item.setAliquotaIpi(parseBigDecimal(getTagValue("pIPI", ipiGrupo)));
                    item.setValorIpiItem(parseBigDecimal(getTagValue("vIPI", ipiGrupo)));
                }
            }
        }

        System.out.println("[LOG NOTA-RECEBIMENTO] Buscando relacionamento para o item do fornecedor: " + cProd);
        
        Optional<ProdutoFornecedor> vinculoExistente = produtoFornecedorRepository
                .findByCnpjFornecedorAndCodigoFornecedor(cnpjFornecedor, cProd);

        if (vinculoExistente.isPresent()) {
            System.out.println("[LOG NOTA-RECEBIMENTO] Vínculo De-Para encontrado automaticamente para o item: " + cProd);
            item.setProduto(vinculoExistente.get().getProduto());
        } else {
            String ean = getTagValue("cEAN", prod);

            // CORREÇÃO: Avalia a nulidade diretamente na condição do if.
            // O compilador agora entende com 100% de certeza que o bloco interno só executa se 'ean' NÃO for nulo.
            if (ean != null && !ean.isBlank() && !ean.equalsIgnoreCase("SEM GTIN")) {
                System.out.println("[LOG NOTA-RECEBIMENTO] De-Para não encontrado. Tentando vincular por EAN: " + ean);
                Optional<Produto> produtoPorEan = produtoRepository.findByCodigoBarras(ean.trim());

                if (produtoPorEan.isPresent()) {
                    Produto prodEncontrado = produtoPorEan.get();
                    System.out.println("[LOG NOTA-RECEBIMENTO] Sucesso! Produto localizado no ERP por EAN: " + prodEncontrado.getDescricao());
                    item.setProduto(prodEncontrado);

                    gravarVinculoDePara(nota.getFornecedor(), cProd, prodEncontrado, item.getValorUnitario());
                } else {
                    System.out.println("[LOG NOTA-RECEBIMENTO] Produto com EAN " + ean + " não cadastrado no banco de dados.");
                }
            }

            if (item.getProduto() == null && item.getDescricaoNota() != null && !item.getDescricaoNota().isBlank()) {
                String descricaoXml = item.getDescricaoNota().trim();
                System.out.println("[LOG NOTA-RECEBIMENTO] Tentando localizar produto por Descrição Exata: '" + descricaoXml + "'");
                
                List<Produto> produtosPorDescricao = produtoRepository.buscarPorDescricao(descricaoXml);
                
                Optional<Produto> correspondenciaExata = produtosPorDescricao.stream()
                        .filter(p -> p.getDescricao() != null && p.getDescricao().trim().equalsIgnoreCase(descricaoXml))
                        .findFirst();

                if (correspondenciaExata.isPresent()) {
                    Produto prodEncontrado = correspondenciaExata.get();
                    System.out.println("[LOG NOTA-RECEBIMENTO] Sucesso! Produto localizado por Descrição: " + prodEncontrado.getDescricao());
                    item.setProduto(prodEncontrado);

                    gravarVinculoDePara(nota.getFornecedor(), cProd, prodEncontrado, item.getValorUnitario());
                }
            }
        }

        return item;
    }

    @Transactional
    public void vincularItem(Long itemId, Long produtoId) {
        ItemNotaRecebimento item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado: " + itemId));

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + produtoId));

        item.setProduto(produto);
        itemRepository.save(item);
        Fornecedor fornecedor = item.getNota().getFornecedor();
        gravarVinculoDePara(fornecedor, item.getCodigoProdutoFornecedor(), produto, item.getValorUnitario());
    }

    @Transactional
    public void confirmarEntrada(Long notaId) {
        System.out.println("[LOG NOTA-RECEBIMENTO] Confirmando entrada física e financeira da nota ID: " + notaId);
        NotaRecebimento nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("Nota não encontrada: " + notaId));

        if (!"RASCUNHO".equals(nota.getStatus())) {
            throw new IllegalStateException("Apenas notas em RASCUNHO podem ser confirmadas.");
        }

        BigDecimal valorTotalProdutos = nota.getValorTotalProdutos() != null
                ? nota.getValorTotalProdutos() : BigDecimal.ONE;

        BigDecimal frete    = nvl(nota.getValorFrete());
        BigDecimal seguro   = nvl(nota.getValorSeguro());
        BigDecimal desconto = nvl(nota.getValorDesconto());
        BigDecimal outros   = nvl(nota.getOutrasDespesas());
        BigDecimal custosExtras = frete.add(seguro).add(outros).subtract(desconto);

        for (ItemNotaRecebimento item : nota.getItens()) {
            if (item.getProduto() == null) continue; 

            BigDecimal qtd = item.getQuantidadeRecebida() != null
                    ? item.getQuantidadeRecebida() : item.getQuantidadeFaturada();
            if (qtd == null || qtd.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal proporcao = item.getValorTotal() != null && valorTotalProdutos.compareTo(BigDecimal.ZERO) > 0
                    ? item.getValorTotal().divide(valorTotalProdutos, 8, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal custoExtraRateado = custosExtras.multiply(proporcao);
            BigDecimal valorTotalItem = nvl(item.getValorTotal()).add(custoExtraRateado);

            BigDecimal custoRealUnitario = valorTotalItem.divide(qtd, 4, RoundingMode.HALF_UP);
            item.setCustoRealUnitario(custoRealUnitario);
            itemRepository.save(item);

            produtoService.atualizarCustoMedioEEstoque(item.getProduto().getId(), qtd, custoRealUnitario);

            gravarVinculoDePara(nota.getFornecedor(), item.getCodigoProdutoFornecedor(),
                    item.getProduto(), item.getValorUnitario());
        }

        nota.setStatus("CONFIRMADO");
        notaRepository.save(nota);
        System.out.println("[LOG NOTA-RECEBIMENTO] Nota Fiscal de Entrada confirmada com sucesso!");
    }

    @Transactional
    public void cancelar(Long notaId) {
        NotaRecebimento nota = notaRepository.findById(notaId)
                .orElseThrow(() -> new RuntimeException("Nota não encontrada: " + notaId));
        if ("CONFIRMADO".equals(nota.getStatus())) {
            throw new IllegalStateException("Uma nota já confirmada não pode ser cancelada por aqui. Faça um estorno manualmente.");
        }
        nota.setStatus("CANCELADO");
        notaRepository.save(nota);
    }

    public List<NotaRecebimento> listarTodas() {
        return notaRepository.findAllByOrderByDataEntradaDesc();
    }

    public NotaRecebimento buscarPorId(Long id) {
        return notaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota não encontrada: " + id));
    }

    private Document parsearXml(InputStream is) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(is);
    }

    private void gravarVinculoDePara(Fornecedor fornecedor, String codigoFornecedor, Produto produto, BigDecimal ultimoPreco) {
        if (fornecedor == null || codigoFornecedor == null || produto == null) return;

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
    }

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

    private String resolverFormaPagamento(Element infNFe) {
        Element pag = (Element) infNFe.getElementsByTagNameNS("*", "pag").item(0);
        if (pag == null) return "Sem pagamento";
        Element detPag = (Element) pag.getElementsByTagNameNS("*", "detPag").item(0);
        if (detPag == null) return "Sem pagamento";
        String tPag = getTagValue("tPag", detPag);
        return switch (tPag != null ? tPag : "") {
            case "01" -> "Dinheiro";
            case "02" -> "Cheque";
            case "03" -> "Cartão de Crédito";
            case "04" -> "Cartão de Débito";
            case "15" -> "Boleto";
            case "17" -> "PIX";
            case "90" -> "Sem pagamento";
            default   -> "Outros";
        };
    }

    private String getTagValue(String tag, Element element) {
        if (element == null) return null;
        NodeList nl = element.getElementsByTagNameNS("*", tag);
        if (nl.getLength() > 0) {
            String txt = nl.item(0).getTextContent();
            return txt != null ? txt.trim() : null;
        }
        return null;
    }

    private Element primeiroFilho(Element parent, String tagName) {
        NodeList nl = parent.getElementsByTagNameNS("*", tagName);
        return nl.getLength() > 0 ? (Element) nl.item(0) : null;
    }

    private Element obterPrimeiroElementoFilho(Element parent) {
        NodeList filhos = parent.getChildNodes();
        for (int i = 0; i < filhos.getLength(); i++) {
            if (filhos.item(i).getNodeType() == Node.ELEMENT_NODE) {
                return (Element) filhos.item(i);
            }
        }
        return null;
    }

    private BigDecimal parseBigDecimal(String valor) {
        if (valor == null || valor.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(valor.trim()); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}