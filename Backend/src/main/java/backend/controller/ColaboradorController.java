package backend.controller;

import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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
        // Usando Objects.requireNonNull ou verificação direta para silenciar o warning
        if (logado != null && logado.getEmpresa() != null) {
            Long empresaId = logado.getEmpresa().getId();
            if (empresaId != null) {
                return repository.findAllByEmpresaId(empresaId);
            }
        }
        return repository.findAll();
    }

    @PostMapping("/{id}/upload-foto")
    public ResponseEntity<String> uploadFoto(@PathVariable Long id, @RequestParam("foto") MultipartFile arquivo) {
        // Garantindo que o ID não é nulo logo no início
        if (id == null) return ResponseEntity.badRequest().body("ID inválido");

        try {
            Colaborador colaborador = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            colaborador.setFoto(arquivo.getBytes());
            repository.save(colaborador);
            return ResponseEntity.ok("Foto atualizada com sucesso!");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erro ao processar arquivo: " + e.getMessage());
        }
    }

    @SuppressWarnings("null")
    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> getFoto(@PathVariable Long id) {
        if (id == null) return ResponseEntity.notFound().build();

        return repository.findById(id)
                .map(c -> {
                    byte[] foto = c.getFoto();
                    if (foto != null) {
                        return ResponseEntity.ok()
                                .contentType(MediaType.IMAGE_JPEG)
                                .body(foto);
                    }
                    return ResponseEntity.notFound().<byte[]>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarComEmpresa(@RequestBody Colaborador novo, @AuthenticationPrincipal Colaborador logado) {
        try {
            // O GestaoService vai usar a empresa do Master logado para o novo funcionário
            Colaborador salvo = gestaoService.cadastrarNovoFuncionario(novo, logado);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}