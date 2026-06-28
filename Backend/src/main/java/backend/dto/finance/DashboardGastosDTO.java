package backend.dto.finance;

import java.math.BigDecimal;

public record DashboardGastosDTO(
    BigDecimal totalComprado,
    BigDecimal comprasMes,
    Long pedidosPendentes,
    Long fornecedoresAtivos
) {}