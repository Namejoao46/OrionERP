package backend.infra;

import backend.dto.ErroResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

    // Erro 404 - Quando não encontra algo no banco
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErroResponse> handle404() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErroResponse("Recurso não encontrado", "O ID informado não existe no banco de dados."));
    }

    // Erro 403 - Login ou Senha inválidos
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> handleBadCredentials() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErroResponse("Credenciais inválidas", "Usuário ou senha incorretos. Verifique e tente novamente."));
    }

    // Erro Genérico (O famoso 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> handle500(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResponse("Erro interno no servidor", ex.getLocalizedMessage()));
    }
}