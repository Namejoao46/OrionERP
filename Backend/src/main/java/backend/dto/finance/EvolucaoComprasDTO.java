package backend.dto.finance;

import java.math.BigDecimal;

public record EvolucaoComprasDTO(
    String mes,
    BigDecimal total
) {}
