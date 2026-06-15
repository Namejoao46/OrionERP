package backend.controller.auth;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder; // Simplificado o import
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.model.auth.Colaborador;
import backend.repository.auth.ColaboradorRepository;
import backend.service.security.TokenService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class LoginController {

    // Adicionado o modificador 'final' em todas as dependências abaixo para sanar o aviso do VS Code
    private final AuthenticationManager manager;
    private final TokenService tokenService;
    private final ColaboradorRepository colaboradorRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    @SuppressWarnings("CallToPrintStackTrace")
    public ResponseEntity<?> efetuarligin(@RequestBody Map<String, String> dados) {
        System.out.println(">>> [LoginController] Inicializando fluxo POST /login");
        System.out.println(">>> [LoginController] Login enviado: " + dados.get("login"));
        
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.get("login"), dados.get("senha"));
        
        try {
            System.out.println(">>> [LoginController] Chamando manager.authenticate()...");
            var authentication = manager.authenticate(authenticationToken);
            System.out.println(">>> [LoginController] Autenticação gerenciada aprovada!");
            
            var colaborador = (Colaborador) authentication.getPrincipal();
            System.out.println(">>> [LoginController] Carregado do Principal: ID " + colaborador.getId() + " - " + colaborador.getLogin());
            
            System.out.println(">>> [LoginController] Invocando TokenService para assinatura...");
            var tokenJWT = tokenService.gerarToken(colaborador);
            System.out.println(">>> [LoginController] Token JWT gerado com sucesso.");

            Map<String, Object> resposta = new HashMap<>();
            
            resposta.put("id", colaborador.getId()); 
            resposta.put("token", tokenJWT);
            resposta.put("nome", colaborador.getNome());
            resposta.put("login", colaborador.getLogin());
            
            resposta.put("sobrenome", colaborador.getSobrenome());
            resposta.put("cargo", colaborador.getCargo());
            resposta.put("cpf", colaborador.getCpf());
            resposta.put("matricula", colaborador.getMatricula());
            resposta.put("endereco", colaborador.getEndereco());
            resposta.put("tipoColaborador", colaborador.getTipoColaborador());
            resposta.put("dataNascimento", colaborador.getDataNascimento() != null ? colaborador.getDataNascimento().toString() : null);
            
            if (colaborador.getRole() != null) {
                System.out.println(">>> [LoginController Rastreio] Role mapeada na entidade: " + colaborador.getRole().name());
            } else {
                System.out.println(">>> [LoginController Rastreio] Role está NULA no banco de dados!");
            }
            
            String roleNome = colaborador.getRole() != null ? colaborador.getRole().name() : "USER";
            String roleFinal = roleNome.replace("ROLE_", "").trim().toUpperCase();
            
            System.out.println(">>> [LoginController Rastreio] String final enviada no JSON ao Angular: \"" + roleFinal + "\"");
            
            resposta.put("role", roleFinal);
            resposta.put("foto", colaborador.getFoto() != null ? Base64.getEncoder().encodeToString(colaborador.getFoto()) : null);
            
            if (colaborador.getEmpresa() != null) {
                System.out.println(">>> [LoginController] Vinculo Empresarial Detectado ID: " + colaborador.getEmpresa().getId());
                resposta.put("empresaId", colaborador.getEmpresa().getId());
            } else {
                System.out.println(">>> [LoginController] Vinculo Empresarial NULO (Provável Super Admin)");
                resposta.put("empresaId", null);
            }
            
            System.out.println(">>> [LoginController] Despachando resposta HTTP 200 OK");
            return ResponseEntity.ok(resposta);
            
        } catch (AuthenticationException e) {
            System.err.println(">>> [LoginController] ERRO DE AUTENTICAÇÃO BLOQUEANTE: " + e.getMessage());
            return ResponseEntity.status(403).body("Erro na autenticação: " + e.getMessage());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Colaborador novo) {
        System.out.println(">>> [LoginController] Inicializando auto-cadastro de conta master");
        
        if (novo == null) {
            System.out.println(">>> [LoginController] Recusado: Objeto do colaborador veio nulo.");
            return ResponseEntity.badRequest().body(Map.of("erro", "Dados inválidos", "detalhe", "O corpo da requisição não pode ser vazio."));
        }

        System.out.println(">>> [LoginController] Login desejado: " + novo.getLogin());

        if (novo.getLogin() != null && colaboradorRepository.existsByLogin(novo.getLogin())) {
            System.out.println(">>> [LoginController] Recusado: Login já ocupado no banco.");
            return ResponseEntity.badRequest().body(Map.of("erro", "Login já existe", "detalhe", "Este e-mail já está em uso."));
        }

        if (novo.getRole() == null) novo.setRole(backend.model.auth.UserRole.MASTER);
        if (novo.getTipoColaborador() == null || novo.getTipoColaborador().isEmpty()) novo.setTipoColaborador("MASTER");
        if (novo.getSobrenome() == null) novo.setSobrenome("");
        if (novo.getEndereco() == null) novo.setEndereco("");
        if (novo.getMatricula() == null) novo.setMatricula("0000");
        if (novo.getCargo() == null) novo.setCargo("Gestor Master");

        novo.setSenha(passwordEncoder.encode(novo.getSenha()));
        
        try {
            System.out.println(">>> [LoginController] Gravando dados criptografados do novo Colaborador...");
            Colaborador salvo = colaboradorRepository.save(novo);
            System.out.println(">>> [LoginController] Auto-cadastro finalizado com ID: " + salvo.getId());
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            System.err.println(">>> [LoginController] Erro inesperado na persistência do cadastro: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro no banco", "detalhe", e.getMessage()));
        }
    }
}