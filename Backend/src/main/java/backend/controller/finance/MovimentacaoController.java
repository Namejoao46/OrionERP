package backend.controller.finance;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.model.finance.Movimentacao;
import backend.repository.finance.MovimentacaoRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/movimentacoes")
@CrossOrigin("*") 
@RequiredArgsConstructor
public class MovimentacaoController {

    private final MovimentacaoRepository repository;

    @PostMapping("/entrada")
    public ResponseEntity<Movimentacao> registrarEntrada(@RequestBody Movimentacao data) {
        data.setTipo("ENTRADA");
        data.setDataHora(LocalDateTime.now()); 
        return ResponseEntity.ok(repository.save(data));
    }

    @GetMapping("/recentes")
    public List<Movimentacao> listarUltimas() {
        return repository.findAll(); 
    }
}