package backend.infra;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import backend.dto.ErroResponse;
import jakarta.persistence.EntityNotFoundException;

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

    // 🌟 NOVO: Erro 400 - Captura CNPJ ou Login duplicados no Firebird
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> handleDuplicidade(DataIntegrityViolationException ex) {
        String detalhe = "Verifique se os dados informados já não estão cadastrados.";
        
        if (ex.getMessage() != null && ex.getMessage().contains("EMPRESAS")) {
            detalhe = "Já existe uma empresa cadastrada com este CNPJ.";
        } else if (ex.getMessage() != null && ex.getMessage().contains("COLABORADORES")) {
            detalhe = "Este login ou CPF já está sendo utilizado por outro colaborador.";
        }

        // Adicionado .contentType(...) para obrigar o Angular a ler como JSON limpo!
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(new ErroResponse("Dados duplicados", detalhe));
    }

    // 🌟 NOVO: Erro 400 - Captura erros de digitação de enums/JSON quebrado
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> handleJsonInvalido(HttpMessageNotReadableException ex) {
        String detalhe = "Os dados enviados na requisição estão mal formatados.";
        
        if (ex.getMessage() != null && ex.getMessage().contains("UserRole")) {
            detalhe = "O perfil (role) selecionado é inválido. Use COLABORADOR, MASTER ou ADMIN_DEV.";
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErroResponse("Requisição inválida", detalhe));
    }

    // Erro Genérico (O famoso 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> handle500(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResponse("Erro interno no servidor", ex.getLocalizedMessage()));
    }
}