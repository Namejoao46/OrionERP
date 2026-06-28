package backend.controller.erp;

import java.io.IOException;
import java.util.List;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import backend.model.erp.Fornecedor;
import backend.model.gestao.Empresa;
import backend.repository.erp.FornecedorRepository;
import backend.repository.gestao.EmpresaRepository;
import backend.repository.fiscal.NotaRecebimentoRepository;
import backend.service.fiscal.FornecedorXmlService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fornecedores")
@CrossOrigin("*")
@RequiredArgsConstructor
public class FornecedorController {

    private final FornecedorRepository repository;
    private final EmpresaRepository empresaRepository;
    private final FornecedorXmlService xmlService;
    private final NotaRecebimentoRepository notaRecebimentoRepository;

    @GetMapping
    public List<Fornecedor> listar(@RequestHeader(value = "Empresa-Id") Long empresaId) {
        System.out.println("[LOG FORNECEDOR] Listando fornecedores da Empresa ID: " + empresaId);
        return repository.findByEmpresaId(empresaId);
    }

    @PostMapping("/importar-xml")
    @SuppressWarnings("CallToPrintStackTrace")
    @Transactional
    public ResponseEntity<Fornecedor> importarXml(
            @RequestParam("xml") MultipartFile file,
            @RequestHeader(value = "Empresa-Id") Long empresaId) {
        
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().build();

        try {
            Fornecedor fornecedor = xmlService.lerDadosEmitente(file.getInputStream());
            if (fornecedor == null) return ResponseEntity.badRequest().build();

            Empresa empresaLogada = empresaRepository.findById(empresaId)
                    .orElseThrow(() -> new RuntimeException("Empresa não encontrada."));

            return repository.findByCnpjAndEmpresaId(fornecedor.getCnpj(), empresaId)
                    .map(existente -> {
                        existente.setRazaoSocial(fornecedor.getRazaoSocial());
                        existente.setNomeFantasia(fornecedor.getNomeFantasia() != null ? fornecedor.getNomeFantasia() : existente.getNomeFantasia());
                        existente.setInscricaoEstadual(fornecedor.getInscricaoEstadual());
                        existente.setInscricaoMunicipal(fornecedor.getInscricaoMunicipal());
                        existente.setCrt(fornecedor.getCrt());
                        existente.setLogradouro(fornecedor.getLogradouro());
                        existente.setNumero(fornecedor.getNumero());
                        existente.setComplemento(fornecedor.getComplemento());
                        existente.setBairro(fornecedor.getBairro());
                        existente.setCep(fornecedor.getCep());
                        existente.setCidade(fornecedor.getCidade());
                        existente.setUf(fornecedor.getUf());
                        existente.setCMun(fornecedor.getCMun());
                        existente.setTelefone(fornecedor.getTelefone());
                        
                        return ResponseEntity.ok(repository.save(existente));
                    })
                    .orElseGet(() -> {
                        // 🛠️ CORREÇÃO: Vincula a empresa E salva o novo registro no banco de dados
                        fornecedor.setEmpresa(empresaLogada);
                        Fornecedor novoFornecedor = repository.save(fornecedor);
                        return ResponseEntity.ok(novoFornecedor);
                    });

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/salvar")
    @Transactional
    public ResponseEntity<?> salvarComSeguranca(
            @RequestBody Fornecedor fornecedor,
            @RequestHeader(value = "User-Role", defaultValue = "USER") String userRole,
            @RequestHeader(value = "Empresa-Id") Long empresaId) {
        
        if (fornecedor == null) return ResponseEntity.badRequest().body("Corpo da requisição vazio.");

        if (!"MASTER".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permissão negada.");
        }

        try {
            Empresa empresaLogada = empresaRepository.findById(empresaId)
                    .orElseThrow(() -> new RuntimeException("Empresa não localizada."));

            Fornecedor salvo = repository.findByCnpjAndEmpresaId(fornecedor.getCnpj(), empresaId)
                    .map(existente -> {
                        fornecedor.setId(existente.getId());
                        fornecedor.setEmpresa(empresaLogada);
                        if (fornecedor.getFoto() == null || fornecedor.getFoto().isBlank()) {
                            fornecedor.setFoto(existente.getFoto());
                        }
                        return repository.save(fornecedor);
                    }).orElseGet(() -> {
                        fornecedor.setEmpresa(empresaLogada);
                        return repository.save(fornecedor);
                    });
                    
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao registrar fornecedor: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletar(
            @PathVariable Long id,
            @RequestHeader(value = "User-Role", defaultValue = "USER") String userRole,
            @RequestHeader(value = "Empresa-Id") Long empresaId) {
        
        if (!"MASTER".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permissão negada.");
        }

        return repository.findById(id).map(fornecedor -> {
            // 🔒 BARREIRA MULTI-TENANT: Impede que uma empresa delete dados de outra informando IDs sequenciais na URL
            if (!fornecedor.getEmpresa().getId().equals(empresaId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado a este registro.");
            }

            try {
                repository.delete(fornecedor);
                return ResponseEntity.ok().build();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                notaRecebimentoRepository.deleteByFornecedorId(id);
                repository.delete(fornecedor);
                return ResponseEntity.ok().build();
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/foto")
    @Transactional
    public ResponseEntity<?> fazerUploadFoto(
            @PathVariable Long id, 
            @RequestParam("foto") MultipartFile file,
            @RequestHeader(value = "User-Role", defaultValue = "USER") String userRole,
            @RequestHeader(value = "Empresa-Id") Long empresaId) {
        
        if (!"MASTER".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permissão negada.");
        }

        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body("Arquivo inválido.");

        return repository.findById(id).map(fornecedor -> {
            // 🔒 BARREIRA MULTI-TENANT: Garante a posse do registro antes de aceitar a mídia
            if (!fornecedor.getEmpresa().getId().equals(empresaId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
            }

            try {
                byte[] bytes = file.getBytes();
                String base64Image = "data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(bytes);
                fornecedor.setFoto(base64Image);
                return ResponseEntity.ok(repository.save(fornecedor));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao processar imagem.");
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}