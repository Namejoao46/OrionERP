package backend.controller;

import backend.model.Colaborador;
import backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class LoginController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody Map<String, String> dados) {
        System.out.println(">>> [LoginController] Tentativa de login com usuário: " + dados.get("login"));

        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.get("login"), dados.get("senha"));
        
        try {
            var authentication = manager.authenticate(authenticationToken);
            var tokenJWT = tokenService.gerarToken((Colaborador) authentication.getPrincipal());

            System.out.println(">>> [LoginController] Login bem-sucedido para usuário: " + dados.get("login"));
            return ResponseEntity.ok(Map.of("token", tokenJWT));
        } catch (Exception e) {
            System.out.println(">>> [LoginController] Falha na autenticação: " + e.getMessage());
            return ResponseEntity.status(403).body(Map.of("erro", "Credenciais inválidas"));
        }
    }
}