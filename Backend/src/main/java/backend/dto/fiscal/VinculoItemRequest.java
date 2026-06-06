package backend.dto.fiscal;


public record VinculoItemRequest(
    Long itemNotaId,   
    Long produtoId       
) {}