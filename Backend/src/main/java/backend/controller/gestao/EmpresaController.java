package backend.controller.gestao;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import backend.model.gestao.Empresa;
import backend.repository.gestao.EmpresaRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin("*")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaRepository repository;

    @PostMapping(consumes = {"multipart/form-data"})
    @Transactional // Garante a segurança da operação no banco de dados
    public ResponseEntity<Empresa> cadastrar(
            @RequestParam("empresa") String empresaJson,
            @RequestParam(value = "logo", required = false) MultipartFile logo) throws IOException {
        
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Configura o ObjectMapper para reconhecer os módulos do Java 8+ se necessário (ex: datas)
        objectMapper.findAndRegisterModules(); 
        
        Empresa empresa = objectMapper.readValue(empresaJson, Empresa.class);

        // Se uma imagem foi enviada, extrai os bytes e salva no objeto
        if (logo != null && !logo.isEmpty()) {
            empresa.setLogo(logo.getBytes());
        }

        Empresa salva = repository.save(empresa);

        // Retorna status 201 (Created) em vez de 200 (OK) para sinalizar sucesso de criação
        return Optional.ofNullable(salva)
                .map(e -> ResponseEntity.status(HttpStatus.CREATED).body(e))
                .orElse(ResponseEntity.internalServerError().build());
    }

    @GetMapping
    public List<Empresa> listarTodas() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empresa> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(empresa -> ResponseEntity.ok().body(empresa))
                .orElse(ResponseEntity.notFound().build());
    }
}