package backend.service.fiscal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import lombok.extern.slf4j.Slf4j; // 🔹 Injetando tracking profissional

import backend.model.fiscal.DuplicataNota;
import backend.model.fiscal.ItemNotaRecebimento;
import backend.model.fiscal.NotaRecebimento;

@Slf4j // 🔹 Ativa o logger para monitoramento do motor de parseamento
@Component
public class NotaRecebimentoParser {

    private static final DateTimeFormatter DT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @SuppressWarnings("UseSpecificCatch")
    public Document parsearXml(java.io.InputStream is) throws Exception {
        long startTime = System.nanoTime();
        log.info("[TRACKING-PARSER] [INIT] Convertendo InputStream binário em objeto DOM Document.");
        
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(is);
            
            double elapsedMs = (System.nanoTime() - startTime) / 1_000_000.0;
            log.info("[TRACKING-PARSER] [SUCCESS] Árvore DOM gerada com sucesso. Tempo: {}ms", String.format("%.2f", elapsedMs));
            return doc;
        } catch (Exception e) {
            log.error("[TRACKING-PARSER] [FATAL] O arquivo enviado não é um XML válido ou está corrompido. Erro: {}", e.getMessage());
            throw e;
        }
    }

    public String extrairChave(Document doc) {
        log.info("[TRACKING-PARSER] Extraindo Chave de Acesso única do documento fiscal.");
        String chave = getTagValue("chNFe", doc.getDocumentElement());
        
        if (chave == null || chave.isBlank()) {
            log.warn("[TRACKING-PARSER] Tag <chNFe> não encontrada. Tentando extrair do atributo 'Id' da tag <infNFe>.");
            NodeList infNFeList = doc.getElementsByTagNameNS("*", "infNFe");
            Element infNFeAttr = infNFeList.getLength() > 0 ? (Element) infNFeList.item(0) : null;
            if (infNFeAttr != null && infNFeAttr.hasAttribute("Id")) {
                chave = infNFeAttr.getAttribute("Id").replace("NFe", "");
            }
        }
        
        if (chave == null || chave.isBlank()) {
            log.error("[TRACKING-PARSER] [CRITICAL] Não foi possível determinar a Chave de Acesso da NF-e no XML.");
        } else {
            log.info("[TRACKING-PARSER] Chave de Acesso mapeada: '{}'", chave);
        }
        return chave;
    }

    public void preencherDadosMestres(NotaRecebimento nota, Element ide, String chave) {
        if (ide == null) {
            log.error("[TRACKING-PARSER] Bloco identificador <ide> nulo. Impossível extrair dados mestres.");
            return;
        }
        
        nota.setNumeroNota(getTagValue("nNF", ide));
        nota.setSerie(getTagValue("serie", ide));
        nota.setChaveAcesso(chave);
        nota.setNaturezaOperacao(getTagValue("natOp", ide));

        String dhEmi = getTagValue("dhEmi", ide);
        if (dhEmi != null && !dhEmi.isBlank()) {
            try {
                nota.setDataEmissao(LocalDateTime.parse(dhEmi, DT_FORMATTER));
            } catch (Exception e) {
                log.error("[TRACKING-PARSER] Falha ao converter tag <dhEmi> ({}) usando padrão ISO. Erro: {}", dhEmi, e.getMessage());
            }
        }
        nota.setDataEntrada(LocalDateTime.now());
    }

    public void preencherTotais(NotaRecebimento nota, Element icmsTot) {
        if (icmsTot == null) {
            log.warn("[TRACKING-PARSER] Bloco financeiro totalizador <ICMSTot> não localizado no XML.");
            return;
        }
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
        
        log.info("[TRACKING-PARSER] Totais da nota processados. vProd: BRL {} | vNF: BRL {}", 
                nota.getValorTotalProdutos(), nota.getValorTotalNota());
    }

    public ItemNotaRecebimento extrairItem(Element det, NotaRecebimento nota) {
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
        
        log.info("[TRACKING-PARSER] Item extraído do XML -> Código Forn: '{}' | Descrição: '{}' | Total Item: BRL {}", 
                item.getCodigoProdutoFornecedor(), item.getDescricaoNota(), item.getValorTotal());
        return item;
    }

    public List<DuplicataNota> extrairDuplicatas(Element cobr, NotaRecebimento nota) {
        List<DuplicataNota> duplicatas = new ArrayList<>();
        if (cobr == null) return duplicatas;

        NodeList dupList = cobr.getElementsByTagNameNS("*", "dup");
        for (int i = 0; i < dupList.getLength(); i++) {
            Element dup = (Element) dupList.item(i);
            DuplicataNota d = new DuplicataNota();
            d.setNota(nota);
            d.setNumeroParcela(getTagValue("nDup", dup));
            String venc = getTagValue("dVenc", dup);
            if (venc != null && !venc.isBlank()) {
                try {
                    d.setDataVencimento(LocalDate.parse(venc, DATE_FORMATTER));
                } catch (Exception e) {
                    log.error("[TRACKING-PARSER] Erro na conversão do vencimento da duplicata ({}): {}", venc, e.getMessage());
                }
            }
            d.setValor(parseBigDecimal(getTagValue("vDup", dup)));
            duplicatas.add(d);
        }
        return duplicatas;
    }

    public String resolverFormaPagamento(Element infNFe) {
        Element pag = (Element) infNFe.getElementsByTagNameNS("*", "pag").item(0);
        if (pag == null) return "Sem pagamento";
        Element detPag = (Element) pag.getElementsByTagNameNS("*", "detPag").item(0);
        if (detPag == null) return "Sem pagamento";
        
        String tPag = getTagValue("tPag", detPag);
        String forma = switch (tPag != null ? tPag : "") {
            case "01" -> "Dinheiro";
            case "02" -> "Cheque";
            case "03" -> "Cartão de Crédito";
            case "04" -> "Cartão de Débito";
            case "15" -> "Boleto";
            case "17" -> "PIX";
            case "90" -> "Sem pagamento";
            default   -> "Outros";
        };
        
        log.info("[TRACKING-PARSER] Tipo de Pagamento identificado: '{}' (Código SEFAZ: {})", forma, tPag);
        return forma;
    }

    public String getTagValue(String tag, Element element) {
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

    public BigDecimal parseBigDecimal(String valor) {
        if (valor == null || valor.isBlank()) return BigDecimal.ZERO;
        try { 
            return new BigDecimal(valor.trim()); 
        } catch (NumberFormatException e) { 
            log.warn("[TRACKING-PARSER] Não foi possível fazer parse numérico do valor '{}'. Assumindo BigDecimal.ZERO.", valor);
            return BigDecimal.ZERO; 
        }
    }
}