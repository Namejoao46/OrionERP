package backend.service.fiscal;

import java.io.InputStream;
import java.util.Optional;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import backend.model.erp.Fornecedor;

@Service 
public class FornecedorXmlService {

    public Fornecedor lerDadosEmitente(InputStream xmlInputStream) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(xmlInputStream);

        NodeList emitList = doc.getElementsByTagName("emit");
        if (emitList.getLength() == 0) {
            throw new Exception("Tag <emit> não encontrada no XML da nota.");
        }

        Element emit = (Element) emitList.item(0);
        Fornecedor f = new Fornecedor();

        f.setCnpj(getTagValue("CNPJ", emit));
        f.setRazaoSocial(getTagValue("xNome", emit));
        f.setNomeFantasia(getTagValue("xFant", emit));
        f.setInscricaoEstadual(getTagValue("IE", emit));

        Optional.ofNullable(getTagValue("CRT", emit))
                .filter(val -> !val.isEmpty())
                .map(Integer::parseInt)
                .ifPresent(f::setCrt);

        Element ender = (Element) emit.getElementsByTagName("enderEmit").item(0);
        if (ender != null) {
            f.setLogradouro(getTagValue("xLgr", ender));
            f.setNumero(getTagValue("nro", ender));
            f.setBairro(getTagValue("xBairro", ender));
            f.setCep(getTagValue("CEP", ender));
            f.setCidade(getTagValue("xMun", ender));
            f.setUf(getTagValue("UF", ender));
        }

        return f;
    }

    private String getTagValue(String tag, Element element) {
        NodeList nl = element.getElementsByTagName(tag);
        if (nl.getLength() > 0 && nl.item(0).getChildNodes().getLength() > 0) {
            return nl.item(0).getChildNodes().item(0).getNodeValue();
        }
        return "";
    }
}