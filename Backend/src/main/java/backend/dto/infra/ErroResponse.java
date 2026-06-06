package backend.dto.infra;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErroResponse {
    private String mensagem;
    private String detalhe;
}