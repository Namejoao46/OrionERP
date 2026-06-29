package backend.controller.erp;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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
    public List<Produto> listarTodos(@RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Buscando todos os produtos cadastrados para Empresa ID: " + empresaId);
        return service.listarTodos(empresaId);
    }

    @GetMapping("/ativos")
    public List<Produto> listarAtivos(@RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Filtrando apenas produtos ativos para Empresa ID: " + empresaId);
        return service.listarAtivos(empresaId);
    }

    @GetMapping("/buscar")
    public List<Produto> buscar(@RequestParam String termo, @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Pesquisa por termo: '" + termo + "' | Empresa: " + empresaId);
        return service.buscarPorDescricao(termo, empresaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id, @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Localizando ID: " + id + " no contexto da Empresa: " + empresaId);
        return ResponseEntity.ok(service.buscarPorId(id, empresaId));
    }

    @GetMapping("/por-fornecedor/{fornecedorId}")
    public ResponseEntity<List<Produto>> listarPorFornecedor(
            @PathVariable Long fornecedorId, 
            @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Listar produtos do fornecedor ID: " + fornecedorId + " | Empresa: " + empresaId);
        List<Produto> produtos = service.listarPorFornecedor(fornecedorId, empresaId);
        return ResponseEntity.ok(produtos);
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody ProdutoRequest req, @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("=================================================");
        System.out.println("[LOG PRODUTO] Requisição de cadastro recebida para Empresa: " + empresaId);
        if (req != null) {
            System.out.println("[LOG PRODUTO] Descrição informada: " + req.descricao());
            System.out.println("[LOG PRODUTO] ID do Fornecedor: " + req.fornecedorId());
        }
        try {
            Produto salvo = service.cadastrar(req, empresaId);
            System.out.println("[LOG PRODUTO] Produto inserido com sucesso. ID: " + salvo.getId());
            return ResponseEntity.ok(salvo);
        } catch (IllegalArgumentException e) {
            System.out.println("[LOG PRODUTO] Validação recusou o cadastro: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } finally {
            System.out.println("=================================================");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(
            @PathVariable Long id, 
            @RequestBody ProdutoRequest req, 
            @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("=================================================");
        System.out.println("[LOG PRODUTO] Requisição para editar o produto ID: " + id + " | Empresa: " + empresaId);
        try {
            Produto atualizado = service.editar(id, req, empresaId);
            System.out.println("[LOG PRODUTO] Atualização persistida com sucesso.");
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            System.out.println("[LOG PRODUTO] ERRO ao editar produto: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } finally {
            System.out.println("=================================================");
        }
    }

    @PostMapping("/{id}/duplicar")
    public ResponseEntity<?> duplicar(@PathVariable Long id, @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Executando duplicação do ID: " + id + " | Empresa: " + empresaId);
        try {
            Produto copia = service.duplicar(id, empresaId);
            System.out.println("[LOG PRODUTO] Sucesso ao duplicar! Novo ID: " + copia.getId());
            return ResponseEntity.ok(copia);
        } catch (Exception e) {
            System.out.println("[LOG PRODUTO] ERRO crítico ao clonar produto: " + e.getMessage());
            return ResponseEntity.badRequest().body("Erro ao duplicar produto: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Mudança de status do ID: " + id + " para " + status + " | Empresa: " + empresaId);
        try {
            Produto modificado = service.alterarStatus(id, status, empresaId);
            System.out.println("[LOG PRODUTO] Status atualizado no banco.");
            return ResponseEntity.ok(modificado);
        } catch (Exception e) {
            System.out.println("[LOG PRODUTO] ERRO ao modificar status: " + e.getMessage());
            return ResponseEntity.badRequest().body("Erro ao alterar status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id, @RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("=================================================");
        System.out.println("[LOG PRODUTO] Comando DELETE recebido para o ID: " + id + " | Empresa: " + empresaId);
        try {
            service.deletar(id, empresaId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            System.out.println("[LOG PRODUTO] RECUSADO por regra de negócio: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            System.out.println("[LOG PRODUTO] ERRO: Produto não encontrado.");
            return ResponseEntity.notFound().build();
        } finally {
            System.out.println("=================================================");
        }
    }

    @GetMapping("/estoque-baixo")
    public List<Produto> listarEstoqueBaixo(@RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Requisição para relatório de estoque baixo da Empresa ID: " + empresaId);
        return service.listarEstoqueBaixo(empresaId);
    }

    @GetMapping("/patrimonio-total")
    public ResponseEntity<BigDecimal> obterValorTotalEstoque(@RequestHeader("X-Empresa-Id") Long empresaId) {
        System.out.println("[LOG PRODUTO] Requisitando avaliação monetária do estoque para Empresa ID: " + empresaId);
        return ResponseEntity.ok(service.calcularTotalPatrimonialEstoque(empresaId));
    }
}