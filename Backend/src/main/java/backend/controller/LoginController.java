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
import backend.repository.ColaboradorRepository;
import backend.service.TokenService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class LoginController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private ColaboradorRepository colaboradorRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody Map<String, String> dados) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.get("login"), dados.get("senha"));
        
        try {
            var authentication = manager.authenticate(authenticationToken);
            var colaborador = (Colaborador) authentication.getPrincipal();
            var tokenJWT = tokenService.gerarToken(colaborador);

            Map<String, Object> resposta = new HashMap<>();
            resposta.put("token", tokenJWT);
            resposta.put("nome", colaborador.getNome());
            resposta.put("foto", colaborador.getFoto() != null ? Base64.getEncoder().encodeToString(colaborador.getFoto()) : null);
            
            // CORREÇÃO: Verifica se a role é nula antes de chamar .name()
            String roleName = (colaborador.getRole() != null) ? colaborador.getRole().name() : "ADMIN_DEV";
            resposta.put("role", roleName);
            
            resposta.put("cargo", colaborador.getCargo());

            return ResponseEntity.ok(resposta);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(403).body(Map.of("erro", "Credenciais inválidas"));
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Colaborador novo) {
        if (colaboradorRepository.existsByLogin(novo.getLogin())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Login já existe"));
        }
        novo.setSenha(passwordEncoder.encode(novo.getSenha()));
        colaboradorRepository.save(novo);
        return ResponseEntity.ok(Map.of("status", "Usuário registrado com sucesso"));
    }
}