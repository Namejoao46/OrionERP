package backend.dto.finance;

import java.math.BigDecimal;

public record DashboardFinanceDTO (
    BigDecimal saldoEmCaixa,
    BigDecimal receitaTotal,
    BigDecimal despesaTotal,
    BigDecimal lucroLiquido
) {}
