package backend.controller.erp;

import java.util.List;

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
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService service;

    @GetMapping
    public List<Produto> listarTodos() {
        System.out.println("[LOG PRODUTO] Buscando todos os produtos cadastrados.");
        return service.listarTodos();
    }

    @GetMapping("/ativos")
    public List<Produto> listarAtivos() {
        System.out.println("[LOG PRODUTO] Filtrando apenas produtos ativos.");
        return service.listarAtivos();
    }

    @GetMapping("/buscar")
    public List<Produto> buscar(@RequestParam String termo) {
        System.out.println("[LOG PRODUTO] Pesquisa de produto por termo. Valor buscado: '" + termo + "'");
        return service.buscarPorDescricao(termo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        System.out.println("[LOG PRODUTO] Localizando produto específico pelo ID: " + id);
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/por-fornecedor/{fornecedorId}")
    public ResponseEntity<List<Produto>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        System.out.println("[LOG PRODUTO] Requisição recebida para listar produtos do fornecedor ID: " + fornecedorId);
        List<Produto> produtos = service.listarPorFornecedor(fornecedorId);
        return ResponseEntity.ok(produtos);
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody ProdutoRequest req) {
        System.out.println("=================================================");
        System.out.println("[LOG PRODUTO] Requisição de cadastro de produto recebida.");
        if (req != null) {
            System.out.println("[LOG PRODUTO] Descrição informada: " + req.descricao());
            System.out.println("[LOG PRODUTO] ID do Fornecedor vinculado: " + req.fornecedorId());
        }
        try {
            Produto salvo = service.cadastrar(req);
            System.out.println("[LOG PRODUTO] Produto inserido com sucesso. ID gerado: " + salvo.getId());
            return ResponseEntity.ok(salvo);
        } catch (IllegalArgumentException e) {
            System.out.println("[LOG PRODUTO] AVISO: Validação de negócio recusou o cadastro. Motivo: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } finally {
            System.out.println("=================================================");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody ProdutoRequest req) {
        System.out.println("=================================================");
        System.out.println("[LOG PRODUTO] Requisição para editar o produto ID: " + id);
        try {
            Produto atualizado = service.editar(id, req);
            System.out.println("[LOG PRODUTO] Atualização persistida com sucesso.");
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            System.out.println("[LOG PRODUTO] ERRO: Não foi possível editar o produto. Motivo: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } finally {
            System.out.println("=================================================");
        }
    }

    @PostMapping("/{id}/duplicar")
    public ResponseEntity<?> duplicar(@PathVariable Long id) {
        System.out.println("[LOG PRODUTO] Executando comando de duplicação para o produto original ID: " + id);
        try {
            Produto copia = service.duplicar(id);
            System.out.println("[LOG PRODUTO] Sucesso ao duplicar! Novo ID criado: " + copia.getId());
            return ResponseEntity.ok(copia);
        } catch (Exception e) {
            System.out.println("[LOG PRODUTO] ERRO crítico ao tentar duplicar o produto.");
            System.out.println("[LOG PRODUTO] Detalhes: " + e.getMessage());
            return ResponseEntity.badRequest().body("Erro ao duplicar produto: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        System.out.println("[LOG PRODUTO] Mudança parcial de status solicitada. ID: " + id + " | Novo Status: " + status);
        try {
            Produto modificado = service.alterarStatus(id, status);
            System.out.println("[LOG PRODUTO] Status atualizado no banco.");
            return ResponseEntity.ok(modificado);
        } catch (Exception e) {
            System.out.println("[LOG PRODUTO] ERRO ao modificar status do produto.");
            System.out.println("[LOG PRODUTO] Detalhes: " + e.getMessage());
            return ResponseEntity.badRequest().body("Erro ao alterar status: " + e.getMessage());
        }
    }
}