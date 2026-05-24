package backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record NotaImportadaResponse(

    String numeroNota,
    String serie,
    String chaveAcesso,
    LocalDateTime dataEmissao,
    LocalDateTime dataEntrada,
    String naturezaOperacao,

    FornecedorResumo fornecedor,
    String statusFornecedor, 
    BigDecimal valorTotalProdutos,
    BigDecimal valorTotalNota,
    BigDecimal valorFrete,
    BigDecimal valorSeguro,
    BigDecimal valorDesconto,
    BigDecimal outrasDespesas,
    BigDecimal baseCalculoIcms,
    BigDecimal valorIcms,
    BigDecimal valorSt,
    BigDecimal valorIpi,
    BigDecimal valorPis,
    BigDecimal valorCofins,

    List<ItemImportadoResponse> itens,

    String formaPagamento,
    List<DuplicataResponse> duplicatas,
    Long notaId

) {
    public record FornecedorResumo(
        Long id,
        String cnpj,
        String razaoSocial,
        String nomeFantasia,
        String inscricaoEstadual,
        String cidade,
        String uf
    ) {}

    public record ItemImportadoResponse(
        Long itemId,
        String codigoProdutoFornecedor,
        String descricaoNota,
        String ncm,
        String cfop,
        String unidadeComercial,
        String cst,
        BigDecimal quantidadeFaturada,
        BigDecimal quantidadeRecebida,
        BigDecimal valorUnitario,
        BigDecimal valorTotal,
        BigDecimal aliquotaIcms,
        BigDecimal valorIcmsItem,
        BigDecimal aliquotaIpi,
        BigDecimal valorIpiItem,
        Long produtoId,      
        String produtoDescricao
    ) {}

    public record DuplicataResponse(
        String numeroParcela,
        java.time.LocalDate dataVencimento,
        BigDecimal valor
    ) {}
}