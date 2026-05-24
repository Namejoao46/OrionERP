package backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backend.dto.NotaImportadaResponse;
import backend.dto.VinculoItemRequest;
import backend.model.NotaRecebimento;
import backend.service.NotaRecebimentoService;

@RestController
@RequestMapping("/api/notas-recebimento")
@CrossOrigin("*")
public class NotaRecebimentoController {

    @Autowired
    private NotaRecebimentoService service;

    @PostMapping("/importar-xml")
    public ResponseEntity<?> importarXml(@RequestParam("xml") MultipartFile arquivo) {
        if (arquivo.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo XML não enviado.");
        }
        try {
            NotaImportadaResponse resposta = service.importarXml(arquivo.getInputStream());
            return ResponseEntity.ok(resposta);
        } catch (IllegalStateException e) {
            // NF-e duplicada
            return ResponseEntity.status(409).body(Map.of("erro", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao processar o XML: " + e.getMessage()));
        }
    }

    @PostMapping("/vincular-item")
    public ResponseEntity<?> vincularItem(@RequestBody VinculoItemRequest req) {
        try {
            service.vincularItem(req.itemNotaId(), req.produtoId());
            return ResponseEntity.ok(Map.of("status", "Item vinculado com sucesso."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

   
    @PostMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmar(@PathVariable Long id) {
        try {
            service.confirmarEntrada(id);
            return ResponseEntity.ok(Map.of("status", "Entrada confirmada com sucesso."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            service.cancelar(id);
            return ResponseEntity.ok(Map.of("status", "Nota cancelada."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public List<NotaRecebimento> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaRecebimento> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}