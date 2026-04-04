package backend.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.model.Colaborador;
import backend.service.TokenService;

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
            var colaborador = (Colaborador) authentication.getPrincipal();
            System.out.println(">>> [DEBUG] Usuário: " + colaborador.getLogin());
            System.out.println(">>> [DEBUG] Tem foto no banco? " + (colaborador.getFoto() != null));
            if(colaborador.getFoto() != null) {
                System.out.println(">>> [DEBUG] Tamanho da foto: " + colaborador.getFoto().length + " bytes");
            }
            var tokenJWT = tokenService.gerarToken((Colaborador) authentication.getPrincipal());

            System.out.println(">>> [LoginController] Login bem-sucedido para usuário: " + dados.get("login"));
            
            Map<String, Object> resposta = new HashMap<>();
            resposta.put("token", tokenJWT);
            resposta.put("nome", colaborador.getNome());
            resposta.put("foto", colaborador.getFoto() != null ? Base64.getEncoder().encodeToString(colaborador.getFoto()) : null);
            resposta.put("cargo", colaborador.getCargo());

            return ResponseEntity.ok(resposta);
        } catch (AuthenticationException e) {
            System.out.println(">>> [LoginController] Falha na autenticação: " + e.getMessage());
            return ResponseEntity.status(403).body(Map.of("erro", "Credenciais inválidas"));
        }
    }
}