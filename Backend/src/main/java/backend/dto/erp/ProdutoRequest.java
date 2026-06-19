package backend.dto.erp;

import java.math.BigDecimal;

public record ProdutoRequest(
    Long fornecedorId, 
    String codigoBarras,
    String descricao,
    String unidadeMedida,
    String categoria,
    String status,
    BigDecimal estoqueAtual,
    BigDecimal estoqueMinimo,
    BigDecimal estoqueMaximo,
    String localizacaoFisica,
    BigDecimal precoCusto,
    BigDecimal margemLucro,
    BigDecimal precoVenda,
    String ncm,
    String cest,
    String origemProduto,
    String cstIcms,
    BigDecimal aliquotaIcms,
    BigDecimal aliquotaPis,
    BigDecimal aliquotaCofins
) {}