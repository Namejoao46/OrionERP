package backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backend.model.Colaborador;
import backend.repository.ColaboradorRepository;

@RestController
@RequestMapping("/api/colaboradores")
@CrossOrigin("*")
public class ColaboradorController {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private backend.service.GestaoService gestaoService;

    @GetMapping("/equipe")
    public List<Colaborador> listarEquipe(@AuthenticationPrincipal Colaborador logado) {
        System.out.println(">>> [ColaboradorController] Acessou /equipe");
        if (logado != null) {
            System.out.println(">>> [ColaboradorController] /equipe - Logado: " + logado.getLogin());
            if (logado.getEmpresa() != null) {
                System.out.println(">>> [ColaboradorController] /equipe - Empresa ID: " + logado.getEmpresa().getId());
                Long empresaId = logado.getEmpresa().getId();
                if (empresaId != null) {
                    return repository.findAllByEmpresaId(empresaId);
                }
            } else {
                System.out.println(">>> [ColaboradorController] /equipe - Usuário logado não possui empresa vinculada");
            }
        } else {
            System.out.println(">>> [ColaboradorController] /equipe - Objeto @AuthenticationPrincipal veio NULO");
        }
        return repository.findAll();
    }

    @PostMapping("/{id}/upload-foto")
    public ResponseEntity<String> uploadFoto(@PathVariable Long id, @RequestParam("foto") MultipartFile arquivo) {
        System.out.println(">>> [ColaboradorController] Acessou /upload-foto para ID URL: " + id);
        if (id == null) return ResponseEntity.badRequest().body("ID inválido");

        try {
            Colaborador colaborador = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            System.out.println(">>> [ColaboradorController] Upload Foto - Colaborador encontrado: " + colaborador.getLogin());
            colaborador.setFoto(arquivo.getBytes());
            repository.save(colaborador);
            System.out.println(">>> [ColaboradorController] Upload Foto - Salvo com sucesso!");
            return ResponseEntity.ok("Foto updated com sucesso!");
        } catch (IOException e) {
            System.err.println(">>> [ColaboradorController] Upload Foto - Erro IO: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro ao processar arquivo: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> getFoto(@PathVariable Long id) {
        System.out.println(">>> [ColaboradorController] Request foto para ID: " + id);
        if (id == null) return ResponseEntity.notFound().build();

        return repository.findById(id)
                .map(c -> {
                    byte[] foto = c.getFoto();
                    if (foto != null) {
                        System.out.println(">>> [ColaboradorController] Foto encontrada para ID " + id + " (" + foto.length + " bytes)");
                        return ResponseEntity.ok()
                                .contentType(MediaType.IMAGE_JPEG)
                                .body(foto);
                    }
                    System.out.println(">>> [ColaboradorController] Registro existe mas a coluna foto está NULA para ID " + id);
                    return ResponseEntity.notFound().<byte[]>build();
                })
                .orElseGet(() -> {
                    System.out.println(">>> [ColaboradorController] ID " + id + " não localizado no banco para buscar foto");
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarComEmpresa(@RequestBody Colaborador novo, @AuthenticationPrincipal Colaborador logado) {
        System.out.println(">>> [ColaboradorController] Request /cadastrar recebida");
        System.out.println(">>> [ColaboradorController] Novo funcionário login enviado: " + (novo != null ? novo.getLogin() : "null"));
        System.out.println(">>> [ColaboradorController] Quem está cadastrando: " + (logado != null ? logado.getLogin() : "null"));
        try {
            Colaborador salvo = gestaoService.cadastrarNovoFuncionario(novo, logado);
            System.out.println(">>> [ColaboradorController] Cadastro realizado com ID: " + salvo.getId());
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            System.err.println(">>> [ColaboradorController] Erro ao cadastrar: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/atualizar-perfil")
    public ResponseEntity<?> atualizarPerfil(
            @PathVariable Long id, 
            @RequestBody Colaborador dadosAtualizados,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails usuarioLogado) { 
        
        System.out.println("-------------------------------------------------------------------");
        System.out.println(">>> [CATCH-ROUTE] Entrou no método atualizarPerfil!");
        System.out.println(">>> [CATCH-ROUTE] Parâmetro ID da URL (@PathVariable): " + id);
        
        if (dadosAtualizados == null) {
            System.out.println(">>> [CATCH-ROUTE] CRÍTICO: RequestBody veio completamente NULO!");
            return ResponseEntity.badRequest().body("Erro: Os dados de atualização não foram fornecidos.");
        }

        try {
            Colaborador colaborador = null;
            
            if (usuarioLogado != null && usuarioLogado.getUsername() != null) {
                System.out.println(">>> [CATCH-ROUTE] Executando: repository.findByLogin(\"" + usuarioLogado.getUsername() + "\")");
                colaborador = repository.findByLogin(usuarioLogado.getUsername()).orElse(null);
            }
            
            if (colaborador == null) {
                System.out.println(">>> [CATCH-ROUTE] Acionando Fallback para busca via ID da URL... ID: " + id);
                if (id == null || id <= 0) {
                    return ResponseEntity.badRequest().body("Erro: Identificação do usuário não fornecida.");
                }
                colaborador = repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado no OrionERP pelo ID informado."));
            }
            
            // ===================================================================
            // GUARDA-COSTAS DOS DADOS CRÍTICOS: Salva o que NUNCA pode ser apagado
            // ===================================================================
            byte[] fotoAtual = colaborador.getFoto();
            String senhaAtual = colaborador.getSenha();
            String loginAtual = colaborador.getLogin();
            backend.model.UserRole roleAtual = colaborador.getRole();
            var empresaAtual = colaborador.getEmpresa();

            System.out.println(">>> [CATCH-ROUTE] Mesclando dados cadastrais com segurança...");
            
            // Atualiza apenas os campos permitidos da tela de perfil
            colaborador.setNome(dadosAtualizados.getNome());
            colaborador.setSobrenome(dadosAtualizados.getSobrenome());
            colaborador.setCargo(dadosAtualizados.getCargo());
            colaborador.setCpf(dadosAtualizados.getCpf());
            colaborador.setMatricula(dadosAtualizados.getMatricula());
            colaborador.setEndereco(dadosAtualizados.getEndereco());
            colaborador.setTipoColaborador(dadosAtualizados.getTipoColaborador());
            
            if (dadosAtualizados.getDataNascimento() != null) {
                colaborador.setDataNascimento(dadosAtualizados.getDataNascimento());
            }

            // ===================================================================
            // RESTAURAÇÃO FORÇADA: Impede o Hibernate de setar NULL nas colunas
            // ===================================================================
            colaborador.setFoto(fotoAtual);
            colaborador.setSenha(senhaAtual);
            colaborador.setLogin(loginAtual);
            colaborador.setRole(roleAtual);
            colaborador.setEmpresa(empresaAtual);

            System.out.println(">>> [CATCH-ROUTE] Executando: repository.save(colaborador)...");
            Colaborador salvo = repository.save(colaborador);
            System.out.println(">>> [CATCH-ROUTE] OPERAÇÃO CONCLUÍDA! Usuário '" + salvo.getLogin() + "' protegido e persistido.");
            System.out.println("-------------------------------------------------------------------");
            
            return ResponseEntity.ok(salvo);
            
        } catch (Exception e) {
            System.err.println(">>> [CATCH-ROUTE] CAPTURA DE ERRO NO CATCH EXCEPTION: " + e.getMessage());
            System.out.println("-------------------------------------------------------------------");
            return ResponseEntity.status(500).body("Erro ao atualizar o perfil: " + e.getMessage());
        }
    }
}