package backend.dto;


public record VinculoItemRequest(
    Long itemNotaId,   
    Long produtoId       
) {}