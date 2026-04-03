package backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping("/{id}/upload-foto")
    public ResponseEntity<String> uploadFoto(@PathVariable Long id, @RequestParam("foto") MultipartFile arquivo) {
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

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> getFoto(@PathVariable Long id) {
        Colaborador colaborador = repository.findById(id).orElseThrow();
        
        if (colaborador.getFoto() != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(colaborador.getFoto());
        }
        return ResponseEntity.notFound().build();
    }
    @GetMapping
    public List<Colaborador> listarTodos() {
        return repository.findAll();
    }
}