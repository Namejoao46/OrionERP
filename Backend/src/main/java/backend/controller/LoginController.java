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
    @SuppressWarnings("CallToPrintStackTrace")
    public ResponseEntity<?> efetuarLogin(@RequestBody Map<String, String> dados) {
        System.out.println("HASH GERADO PELO APP PARA '123456': " + passwordEncoder.encode("123456"));
        System.out.println(">>> [LoginController] Tentativa de login para: " + dados.get("login"));
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.get("login"), dados.get("senha"));
        
        try {
            var authentication = manager.authenticate(authenticationToken);
            var colaborador = (Colaborador) authentication.getPrincipal();
            var tokenJWT = tokenService.gerarToken(colaborador);

            Map<String, Object> resposta = new HashMap<>();
            resposta.put("token", tokenJWT);
            resposta.put("nome", colaborador.getNome());
            resposta.put("role", colaborador.getRole() != null ? colaborador.getRole().toString() : "USER");
            resposta.put("foto", colaborador.getFoto() != null ? Base64.getEncoder().encodeToString(colaborador.getFoto()) : null);
            
            // Verifica se o colaborador tem uma empresa associada (Super Admins não têm)
            if (colaborador.getEmpresa() != null) {
                resposta.put("empresaId", colaborador.getEmpresa().getId());
            } else {
                resposta.put("empresaId", null);
            }
            
            return ResponseEntity.ok(resposta);
            
        } catch (AuthenticationException e) {
            System.out.println(">>> [LoginController] ERRO DE AUTENTICAÇÃO: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.status(403).body("Erro na autenticação: " + e.getMessage());
        }
    }

    @PostMapping("/registrar")
    @SuppressWarnings("CallToPrintStackTrace")
    public ResponseEntity<?> registrar(@RequestBody Colaborador novo) {
        // 1. Validação de segurança de e-mail
        if (novo.getLogin() != null && colaboradorRepository.existsByLogin(novo.getLogin())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Login já existe", "detalhe", "Este e-mail já está em uso."));
        }

        // 2. HIGIENIZAÇÃO COMPATÍVEL COM O FIREBIRD
        // Força a role a ser MASTER caso venha em branco do front
        if (novo.getRole() == null) {
            novo.setRole(backend.model.UserRole.MASTER);
        }
        
        // Alinha o tipo de colaborador com o modelo de negócio 'MASTER'
        if (novo.getTipoColaborador() == null || novo.getTipoColaborador().isEmpty()) {
            novo.setTipoColaborador("MASTER");
        }
        
        // Evita valores nulos em campos obrigatórios do banco
        if (novo.getSobrenome() == null) novo.setSobrenome("");
        if (novo.getEndereco() == null) novo.setEndereco("");
        if (novo.getMatricula() == null) novo.setMatricula("0000");
        if (novo.getCargo() == null) novo.setCargo("Gestor Master");

        // 3. Criptografa e Salva
        novo.setSenha(passwordEncoder.encode(novo.getSenha()));
        
        try {
            Colaborador salvo = colaboradorRepository.save(novo);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro no banco", "detalhe", e.getMessage()));
        }
    }
}