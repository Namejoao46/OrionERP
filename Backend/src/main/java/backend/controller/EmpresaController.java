package backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.model.Empresa;
import backend.repository.EmpresaRepository;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin("*")
public class EmpresaController {

    @Autowired
    private EmpresaRepository repository;

    @PostMapping
    @SuppressWarnings("null")
    public ResponseEntity<Empresa> cadastrar(@RequestBody Empresa empresa) {
        Empresa salva = repository.save(empresa);

        return Optional.ofNullable(salva)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.internalServerError().build());
    }

    @GetMapping
    public List<Empresa> listarTodas() {
        return repository.findAll();
    }
}