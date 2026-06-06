package backend.controller.erp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.dto.erp.ProdutoRequest;
import backend.model.erp.Produto;
import backend.service.erp.ProdutoService;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin("*")
public class ProdutoController {

    @Autowired
    private ProdutoService service;

    @GetMapping
    public List<Produto> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/ativos")
    public List<Produto> listarAtivos() {
        return service.listarAtivos();
    }

    @GetMapping("/buscar")
    public List<Produto> buscar(@RequestParam String termo) {
        return service.buscarPorDescricao(termo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody ProdutoRequest req) {
        try {
            Produto salvo = service.cadastrar(req);
            return ResponseEntity.ok(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody ProdutoRequest req) {
        try {
            Produto atualizado = service.editar(id, req);
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/duplicar")
    public ResponseEntity<Produto> duplicar(@PathVariable Long id) {
        return ResponseEntity.ok(service.duplicar(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Produto> alterarStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.alterarStatus(id, status));
    }
}