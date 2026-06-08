package backend.service.fiscal;

import java.io.InputStream;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import backend.model.erp.Fornecedor;

@Service 
public class FornecedorXmlService {

    /**
     * Lê um arquivo XML completo da NF-e e extrai estritamente o Fornecedor (Emitante)
     */
    @SuppressWarnings("CallToPrintStackTrace")
    public Fornecedor lerDadosEmitente(InputStream xmlInputStream) throws Exception {
        System.out.println("\n-------------------------------------------------");
        System.out.println("[LOG SERVICE-XML] Método 'lerDadosEmitente' iniciado.");
        
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            
            // Exibe a configuração atual do Namespace
            System.out.println("[LOG SERVICE-XML] NamespaceAware está definido como: false");
            factory.setNamespaceAware(false);
            
            DocumentBuilder builder = factory.newDocumentBuilder();
            
            System.out.println("[LOG SERVICE-XML] Iniciando o parse do InputStream...");
            Document doc = builder.parse(xmlInputStream);
            System.out.println("[LOG SERVICE-XML] Parse realizado com sucesso. Procurando tag <emit>...");

            NodeList emitList = doc.getElementsByTagName("emit");
            System.out.println("[LOG SERVICE-XML] Quantidade de tags <emit> encontradas: " + emitList.getLength());
            
            if (emitList.getLength() == 0) {
                System.out.println("[LOG SERVICE-XML] ERRO CRÍTICO: Nenhuma tag <emit> foi localizada no documento!");
                throw new Exception("Tag <emit> não encontrada no XML da nota.");
            }

            System.out.println("[LOG SERVICE-XML] Enviando o elemento <emit> para conversão...");
            Fornecedor fornecedorProcessado = converterElementParaFornecedor((Element) emitList.item(0));
            
            System.out.println("[LOG SERVICE-XML] Conversão concluída com sucesso.");
            return fornecedorProcessado;
            
        } catch (Exception e) {
            System.out.println("[LOG SERVICE-XML] EXCEÇÃO NO CORAÇÃO DA LEITURA DO XML!");
            System.out.println("[LOG SERVICE-XML] Causa raiz: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Fornecedor converterElementParaFornecedor(Element emit) {
        if (emit == null) {
            System.out.println("[LOG SERVICE-XML] AVISO: Elemento <emit> recebido é NULO.");
            return null;
        }

        System.out.println("[LOG SERVICE-XML] Iniciando mapeamento das tags do Emitente...");
        Fornecedor f = new Fornecedor();
        
        f.setCnpj(getTagValue("CNPJ", emit));
        f.setRazaoSocial(getTagValue("xNome", emit));
        f.setNomeFantasia(getTagValue("xFant", emit));
        f.setInscricaoEstadual(getTagValue("IE", emit));
        f.setInscricaoMunicipal(getTagValue("IM", emit));
        f.setCnaePrincipal(getTagValue("CNAE", emit));

        System.out.println("[LOG SERVICE-XML] Dados Base -> CNPJ: " + f.getCnpj() + " | xNome: " + f.getRazaoSocial());

        String crtStr = getTagValue("CRT", emit);
        System.out.println("[LOG SERVICE-XML] Valor bruto da tag <CRT>: '" + crtStr + "'");
        if (crtStr != null && !crtStr.isBlank()) {
            try {
                f.setCrt(Integer.valueOf(crtStr.trim()));
                System.out.println("[LOG SERVICE-XML] CRT convertido com sucesso para Integer: " + f.getCrt());
            } catch (NumberFormatException ignored) {
                System.out.println("[LOG SERVICE-XML] FALHA (Ignorada): Erro ao converter a tag <CRT> para número.");
            }
        }

        System.out.println("[LOG SERVICE-XML] Procurando bloco interno de endereço <enderEmit>...");
        NodeList enderList = emit.getElementsByTagName("enderEmit");
        System.out.println("[LOG SERVICE-XML] Quantidade de blocos <enderEmit> encontrados: " + enderList.getLength());
        
        Element ender = enderList.getLength() > 0 ? (Element) enderList.item(0) : null;
        if (ender != null) {
            System.out.println("[LOG SERVICE-XML] Bloco <enderEmit> localizado. Extraindo tags internas...");
            f.setLogradouro(getTagValue("xLgr", ender));
            f.setNumero(getTagValue("nro", ender));
            f.setComplemento(getTagValue("xCpl", ender));
            f.setBairro(getTagValue("xBairro", ender));
            f.setCep(getTagValue("CEP", ender));
            f.setCidade(getTagValue("xMun", ender));
            f.setUf(getTagValue("UF", ender));
            f.setCMun(getTagValue("cMun", ender));
            f.setTelefone(getTagValue("fone", ender));
            
            System.out.println("[LOG SERVICE-XML] Endereço Extraído -> Rua: " + f.getLogradouro() + ", Cidade: " + f.getCidade() + ", Código IBGE: " + f.getCMun());
        } else {
            System.out.println("[LOG SERVICE-XML] AVISO: Bloco <enderEmit> não existia ou veio vazio.");
        }

        System.out.println("-------------------------------------------------\n");
        return f;
    }

    private String getTagValue(String tag, Element element) {
        if (element == null) return null;
        NodeList nl = element.getElementsByTagName(tag);
        
        if (nl.getLength() > 0) {
            // LOG de depuração fina: Mostra se a tag existe e quantos filhos possui
            int totalFilhos = nl.item(0).getChildNodes().getLength();
            
            if (totalFilhos > 0) {
                String valorExtraido = nl.item(0).getChildNodes().item(0).getNodeValue();
                
                // Correção segura temporária nos logs se o nodeValue falhar por ser espaço em branco
                if (valorExtraido == null) {
                    valorExtraido = nl.item(0).getTextContent();
                }
                
                System.out.println("[LOG TAG] Extraído <" + tag + "> = '" + valorExtraido + "'");
                return valorExtraido;
            }
            System.out.println("[LOG TAG] A tag <" + tag + "> foi achada, mas não contém nós filhos (vazia).");
        } else {
            System.out.println("[LOG TAG] A tag <" + tag + "> NÃO existe nesse bloco.");
        }
        return null;
    }
}