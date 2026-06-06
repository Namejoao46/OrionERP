package backend.controller.erp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backend.model.erp.Fornecedor;
import backend.repository.erp.FornecedorRepository;
import backend.service.fiscal.FornecedorXmlService;

@RestController
@RequestMapping("/api/fornecedores")
@CrossOrigin("*")
public class FornecedorController {

    @Autowired
    private FornecedorRepository repository;

    @Autowired
    private FornecedorXmlService xmlService;

    @GetMapping
    public List<Fornecedor> listar() {
        return repository.findAll();
    }

    @PostMapping("/importar-xml")
    public ResponseEntity<Fornecedor> importarXml(@RequestParam("xml") MultipartFile file) {
        try {
            // Usa o serviço que você criou para ler o XML
            Fornecedor fornecedor = xmlService.lerDadosEmitente(file.getInputStream());
            
            // Verifica se já existe pelo CNPJ
            return repository.findByCnpj(fornecedor.getCnpj())
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.ok(fornecedor)); // Retorna os dados para o front conferir antes de salvar
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
