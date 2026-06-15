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
import backend.repository.erp.FornecedorRepository;
import backend.repository.fiscal.NotaRecebimentoRepository;
import backend.service.fiscal.FornecedorXmlService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fornecedores")
@CrossOrigin("*")
@RequiredArgsConstructor
public class FornecedorController {

    private final FornecedorRepository repository;
    private final FornecedorXmlService xmlService;
    private final NotaRecebimentoRepository notaRecebimentoRepository;

    @GetMapping
    public List<Fornecedor> listar() {
        System.out.println("[LOG FORNECEDOR] Solicitando listagem de todos os fornecedores.");
        return repository.findAll();
    }

    @PostMapping("/importar-xml")
    @SuppressWarnings("CallToPrintStackTrace")
    public ResponseEntity<Fornecedor> importarXml(@RequestParam("xml") MultipartFile file) {
        System.out.println("=================================================");
        System.out.println("[LOG XML] Rota '/importar-xml' foi acionada!");
        
        if (file == null || file.isEmpty()) {
            System.out.println("[LOG XML] ERRO: O arquivo MultipartFile recebido está NULO ou VAZIO!");
            return ResponseEntity.badRequest().build();
        }
        
        System.out.println("[LOG XML] Arquivo recebido: " + file.getOriginalFilename());
        System.out.println("[LOG XML] Tamanho do arquivo: " + file.getSize() + " bytes");
        System.out.println("[LOG XML] Content Type: " + file.getContentType());

        try {
            System.out.println("[LOG XML] Iniciando chamada para o 'xmlService.lerDadosEmitente'...");
            Fornecedor fornecedor = xmlService.lerDadosEmitente(file.getInputStream());
            
            if (fornecedor == null) {
                System.out.println("[LOG XML] AVISO: O 'xmlService' retornou um objeto Fornecedor NULO.");
                return ResponseEntity.badRequest().build();
            }

            System.out.println("[LOG XML] Sucesso ao processar XML!");
            System.out.println("[LOG XML] CNPJ extraído: " + fornecedor.getCnpj());
            System.out.println("[LOG XML] Razão Social extraída: " + fornecedor.getRazaoSocial());
            System.out.println("[LOG XML] Cidade extraída: " + fornecedor.getCidade() + " - " + fornecedor.getUf());

            System.out.println("[LOG XML] Verificando se o CNPJ '" + fornecedor.getCnpj() + "' já existe no banco...");
            return repository.findByCnpj(fornecedor.getCnpj())
                    .map(existente -> {
                        System.out.println("[LOG XML] Fornecedor existente (ID: " + existente.getId() + "). Mesclando novos dados do XML...");
                        
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
                        
                        Fornecedor updated = repository.save(existente);
                        return ResponseEntity.ok(updated);
                    })
                    .orElseGet(() -> {
                        System.out.println("[LOG XML] Novo fornecedor detectado. Enviando dados temporários do XML para a tela.");
                        return ResponseEntity.ok(fornecedor);
                    });

        } catch (Exception e) {
            System.out.println("[LOG XML] CRÍTICO: Exceção capturada ao tentar ler/processar o arquivo XML!");
            System.out.println("[LOG XML] Mensagem do erro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        } finally {
            System.out.println("=================================================");
        }
    }

    @PostMapping("/salvar")
    @SuppressWarnings("CallToPrintStackTrace")
    public ResponseEntity<?> salvarComSeguranca(
            @RequestBody Fornecedor fornecedor,
            @RequestHeader(value = "User-Role", defaultValue = "USER") String userRole) {
        
        System.out.println("=================================================");
        System.out.println("[LOG SALVAR] Rota '/salvar' acionada.");
        System.out.println("[LOG SALVAR] Perfil do usuário recebido no Header (User-Role): " + userRole);
        
        if (fornecedor == null) {
            System.out.println("[LOG SALVAR] ERRO: O corpo do fornecedor (@RequestBody) está vindo NULO.");
            return ResponseEntity.badRequest().body("Corpo da requisição vazio.");
        }
        
        System.out.println("[LOG SALVAR] Dados a salvar -> CNPJ: " + fornecedor.getCnpj() + " | Razão Social: " + fornecedor.getRazaoSocial());

        if (!"MASTER".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            System.out.println("[LOG SALVAR] BLOQUEADO: Permissão negada para o perfil: " + userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Apenas usuários Administradores ou Masters possuem permissão para modificar os fornecedores.");
        }

        try {
            System.out.println("[LOG SALVAR] Iniciando processo de salvamento/atualização no banco...");
            Fornecedor salvo = repository.findByCnpj(fornecedor.getCnpj())
                    .map(existente -> {
                        System.out.println("[LOG SALVAR] Fornecedor já cadastrado. Atualizando ID: " + existente.getId());
                        
                        fornecedor.setId(existente.getId());
                        
                        if (fornecedor.getFoto() == null || fornecedor.getFoto().isBlank()) {
                            System.out.println("[LOG SALVAR] Foto não enviada nesta requisição. Mantendo a foto antiga.");
                            fornecedor.setFoto(existente.getFoto());
                        }
                        return repository.save(fornecedor);
                    }).orElseGet(() -> {
                        System.out.println("[LOG SALVAR] Inserindo novo registro de fornecedor no banco de dados.");
                        return repository.save(fornecedor);
                    });
                    
            System.out.println("[LOG SALVAR] Operação realizada com sucesso! ID salvo: " + salvo.getId());
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            System.out.println("[LOG SALVAR] ERRO: Falha ao salvar a entidade no JPA!");
            System.out.println("[LOG SALVAR] Detalhes do erro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro ao registrar fornecedor: " + e.getMessage());
        } finally {
            System.out.println("=================================================");
        }
    }

    @DeleteMapping("/{id}")
    @Transactional // CRÍTICO: Garante a atomicidade das duas operações de exclusão
    public ResponseEntity<?> deletar(
            @PathVariable Long id,
            @RequestHeader(value = "User-Role", defaultValue = "USER") String userRole) {
        
        System.out.println("=================================================");
        System.out.println("[LOG DELETAR] Rota para exclusão ativada. ID: " + id);
        System.out.println("[LOG DELETAR] User-Role avaliado: " + userRole);

        if (!"MASTER".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            System.out.println("[LOG DELETAR] BLOQUEADO: Perfil não autorizado.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permissão negada para remover registros.");
        }

        return repository.findById(id).map(fornecedor -> {
            try {
                // Tenta deletar diretamente de forma otimista
                repository.delete(fornecedor);
                System.out.println("[LOG DELETAR] Fornecedor '" + fornecedor.getRazaoSocial() + "' deletado com sucesso.");
                return ResponseEntity.ok().build();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                System.out.println("[LOG DELETAR] CONFLITO DE CHAVE ESTRANGEIRA: Identificado vínculo em NOTAS_RECEBIMENTO.");
                System.out.println("[LOG DELETAR] Executando limpeza relacional forçada...");
                
                try {
                    // 1. Remove os rascunhos de notas associados ao ID do fornecedor primeiro
                    notaRecebimentoRepository.deleteByFornecedorId(id);
                    System.out.println("[LOG DELETAR] Dependências em 'NOTAS_RECEBIMENTO' limpas.");

                    // 2. Tenta apagar o fornecedor novamente agora que a restrição sumiu
                    repository.delete(fornecedor);
                    System.out.println("[LOG DELETAR] Fornecedor '" + fornecedor.getRazaoSocial() + "' removido com sucesso após limpeza.");
                    
                    return ResponseEntity.ok().build();
                } catch (Exception ex) {
                    System.out.println("[LOG DELETAR] ERRO CRÍTICO: Falha na limpeza forçada: " + ex.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Falha ao executar limpeza relacional: " + ex.getMessage());
                }
            }
        }).orElseGet(() -> {
            System.out.println("[LOG DELETAR] Registro não localizado.");
            return ResponseEntity.notFound().build();
        });
    }

    @PutMapping("/{id}/foto")
    public ResponseEntity<?> fazerUploadFoto(
            @PathVariable Long id, 
            @RequestParam("foto") MultipartFile file,
            @RequestHeader(value = "User-Role", defaultValue = "USER") String userRole) {
        
        System.out.println("=================================================");
        System.out.println("[LOG FOTO] Rota para upload de foto acionada para o ID: " + id);
        System.out.println("[LOG FOTO] User-Role avaliado: " + userRole);

        if (!"MASTER".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            System.out.println("[LOG FOTO] BLOQUEADO: Perfil não autorizado.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permissão negada para atualizar imagens.");
        }

        if (file == null || file.isEmpty()) {
            System.out.println("[LOG FOTO] ERRO: Arquivo de imagem recebido está nulo ou vazio.");
            return ResponseEntity.badRequest().body("Arquivo de foto inválido.");
        }

        return repository.findById(id).map(fornecedor -> {
            try {
                System.out.println("[LOG FOTO] Fornecedor localizado: " + fornecedor.getRazaoSocial());
                byte[] bytes = file.getBytes();
                System.out.println("[LOG FOTO] Convertendo binário de " + bytes.length + " bytes para Base64...");
                String base64Image = "data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(bytes);
                
                fornecedor.setFoto(base64Image);
                repository.save(fornecedor);
                System.out.println("[LOG FOTO] String Base64 persistida com sucesso na coluna @Lob!");
                return ResponseEntity.ok(fornecedor);
            } catch (IOException e) {
                System.out.println("[LOG FOTO] ERRO: Falha de I/O ao ler os bytes do arquivo.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao processar imagem.");
            }
        }).orElseGet(() -> {
            System.out.println("[LOG FOTO] ERRO: Fornecedor de ID " + id + " não existe na base.");
            return ResponseEntity.notFound().build();
        });
    }
}